const prisma = require('../config/prisma');

async function createTransaction(req, res) {
  try {
    const { groupId, type, amount, note } = req.body;
    const userId = req.user.id;

    if (!groupId || !type || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Cek membership
    const membership = await prisma.savingsMember.findFirst({
      where: { groupId, userId },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        groupId,
        userId,
        type,
        amount,
        note,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}      

async function getGroupTransactions(req, res) {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 5, type } = req.query;
      const userId = req.user.id;
  
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const skip = (pageNumber - 1) * pageSize;
  
      // Validasi membership
      const membership = await prisma.savingsMember.findFirst({
        where: { groupId, userId },
      });
  
      if (!membership) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      const whereClause = {
        groupId,
        ...(type && { type }), // filter kalau ada type
      };
  
      const totalTransactions = await prisma.transaction.count({
        where: whereClause,
      });
  
      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      });
  
      const allTransactions = await prisma.transaction.findMany({
        where: { groupId },
      });
  
      const totalBalance = allTransactions.reduce((acc, t) => {
        return t.type === "INCOME"
          ? acc + t.amount
          : acc - t.amount;
      }, 0);
  
      const formattedTransactions = transactions.map((t) => ({
        id: t.id,
        name: t.user.name,
        type: t.type,
        amount: t.type === "EXPENSE" ? -t.amount : t.amount,
        note: t.note,
        createdAt: t.createdAt,
      }));
  
      return res.json({
        totalBalance,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalTransactions / pageSize),
        totalTransactions,
        transactions: formattedTransactions,
      });
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }            

module.exports = {
  createTransaction,
  getGroupTransactions,
};
