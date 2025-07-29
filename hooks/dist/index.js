const express = require("express");
const { PrismaClient } = require("@prisma/client");

const client = new PrismaClient();
const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId.trim();
  const body = req.body;

  console.log("===> Webhook received");
  console.log("zapId:", zapId);
  console.log("Request body:", body);

  try {
    await client.$transaction(async tx => {
      console.log("===> Inside transaction");

      // ✅ check if zap exists
      const zap = await tx.zap.findUnique({
        where: { id: zapId }
      });
      console.log("Found zap:", zap);

      if (!zap) {
        throw new Error(`Zap with id ${zapId} does not exist`);
      }

      // Create ZapRun
      const run = await tx.zapRun.create({
        data: {
          zapId: zapId,
          metadata: body
        }
      });
      console.log("Created ZapRun:", run);

      // Create ZapRunOutbox
      await tx.zapRunOutbox.create({
        data: {
          zapRunId: run.id
        }
      });
      console.log("Created ZapRunOutbox for run.id:", run.id);
    });

    res.json({
      message: "Webhook received and processed"
    });
  } catch (e) {
    console.error("Error caught:", e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3002, () => {
  console.log("✅ Server running on http://localhost:3002");
});
