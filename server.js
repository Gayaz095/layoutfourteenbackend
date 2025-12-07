const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "ordersData.json");

console.log("📁 DATA_FILE path:", DATA_FILE);
console.log("📂 Current directory:", __dirname);

app.use(cors());
app.use(express.json());

// Check if file exists
fs.access(DATA_FILE)
  .then(() => {
    console.log("✅ ordersData.json exists");
  })
  .catch(() => {
    console.log("❌ ordersData.json NOT FOUND - create it in backend/ folder!");
  });

// Read from ordersData.json
const readOrders = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const orders = JSON.parse(data);
    console.log(`📖 Loaded ${orders.length} orders from ordersData.json`);
    return orders;
  } catch (error) {
    console.error("❌ readOrders error:", error.message);
    return [];
  }
};

// Write to ordersData.json (FRONTEND UPDATES HERE)
const writeOrders = async (orders) => {
  try {
    console.log("💾 Writing to ordersData.json...");
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
    console.log("✅ ordersData.json UPDATED SUCCESSFULLY!");
    return true;
  } catch (error) {
    console.error("❌ writeOrders error:", error.message);
    return false;
  }
};

// GET all orders
app.get("/api/orders", async (req, res) => {
  console.log("🌐 GET /api/orders called");
  const orders = await readOrders();
  res.json(orders);
});

// PUT update order status (FRONTEND → JSON FILE)
app.put("/api/orders/:id", async (req, res) => {
  console.log("🔄 PUT /api/orders/:id called");
  console.log("📥 req.body:", req.body);
  console.log("📥 req.params:", req.params);

  try {
    const { id } = req.params;
    const { status } = req.body;

    const orders = await readOrders();
    const orderIndex = orders.findIndex((order) => order.id === parseInt(id));

    console.log("🔍 Found order at index:", orderIndex);

    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      console.log("✏️ Updated order status to:", status);

      const success = await writeOrders(orders);
      if (success) {
        console.log(`✅ Order ${id} SAVED to ordersData.json`);
        res.json(orders[orderIndex]);
      } else {
        res.status(500).json({ error: "Failed to save" });
      }
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("❌ PUT error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
  console.log(`💾 Frontend dropdown changes → UPDATE ordersData.json`);
});
