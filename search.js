import axios from "axios";

const token = "e50d67f4d865f0813c82bb9d40aecb0b6b032671";

const run = async () => {
  try {
    const res = await axios.get("https://api.moysklad.ru/api/remap/1.2/entity/product?search=клуб", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;charset=utf-8",
      },
    });

    console.log("📦 Найдено товаров:");
    res.data.rows.forEach((item, i) => {
      console.log(`${i + 1}. ${item.name} — ID: ${item.id}`);
    });
  } catch (err) {
    console.error("❌ Ошибка:", err.response?.data || err.message);
  }
};

run();
