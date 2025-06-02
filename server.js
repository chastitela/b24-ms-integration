import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// 🔐 Конфигурация
const MS_TOKEN = "e50d67f4d865f0813c82bb9d40aecb0b6b032671";
const ORG_ID = "f5063789-1aa4-11f0-0a80-13420009845e";
const STORE_ID = "f507f08d-1aa4-11f0-0a80-134200098462";

const HEADERS = {
  Authorization: `Bearer ${MS_TOKEN}`,
  Accept: "application/json;charset=utf-8",
  "Content-Type": "application/json",
};

// 🔍 Найти товар или создать, если не найден
const findOrCreateProduct = async (name) => {
  const res = await axios.get(
    `https://api.moysklad.ru/api/remap/1.2/entity/product?search=${encodeURIComponent(name)}`,
    { headers: HEADERS }
  );

  if (res.data.rows.length > 0) {
    return res.data.rows[0];
  }

  console.log(`🔧 Товар "${name}" не найден. Создаю...`);

  const created = await axios.post(
    "https://api.moysklad.ru/api/remap/1.2/entity/product",
    {
      name,
      description: "Автоматически создан из Bitrix24",
    },
    { headers: HEADERS }
  );

  return created.data;
};

// 📥 Создание документа "Оприходование"
const createEnter = async (productId, quantityKg, comment) => {
  const res = await axios.post(
    "https://api.moysklad.ru/api/remap/1.2/entity/enter",
    {
      name: `B24 → МС: Оприходование ${new Date().toISOString()}`,
      organization: {
        meta: {
          href: `https://api.moysklad.ru/api/remap/1.2/entity/organization/${ORG_ID}`,
          type: "organization",
          mediaType: "application/json",
        },
      },
      store: {
        meta: {
          href: `https://api.moysklad.ru/api/remap/1.2/entity/store/${STORE_ID}`,
          type: "store",
          mediaType: "application/json",
        },
      },
      positions: [
        {
          quantity: quantityKg,
          price: 0,
          assortment: {
            meta: {
              href: `https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`,
              type: "product",
              mediaType: "application/json",
            },
          },
        },
      ],
      description: comment || "Оприходовано из Bitrix24",
    },
    { headers: HEADERS }
  );

  return res.data;
};

// 🚦 Основной обработчик
app.post("/webhook", async (req, res) => {
  console.log("📥 Получен запрос от Bitrix24:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const { entityTypeId, name, grams, farm, date } = req.body;

    if (String(entityTypeId) !== "1066") {
      console.warn("🚫 Нецелевой смарт-процесс:", entityTypeId);
      return res.status(200).send("Игнорирован — не тот процесс");
    }

    if (!name || name.trim() === "") {
      return res.status(400).send("❌ Не указано название товара (Сырьё)");
    }

    const quantityKg = grams ? grams / 1000 : 0;

    const product = await findOrCreateProduct(name);
    const created = await createEnter(product.id, quantityKg, `Ферма: ${farm}, Дата: ${date}`);

    console.log("✅ Оприходовано:", created.name);
    res.status(200).send("✅ Оприходование создано");
  } catch (err) {
    console.error("❌ Ошибка:", err.response?.data || err.message);
    res.status(500).send("Ошибка на сервере");
  }
});

// 🚀 Запуск сервера
app.listen(3000, () => console.log("🔥 Сервер слушает на http://localhost:3000"));
