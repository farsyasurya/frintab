const prisma = require("../config/prisma");
const generateCode = require("../utils/generateCode");

async function createGroup(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Group name required" });
    }

    const groupCode = generateCode();

    const group = await prisma.savingsGroup.create({
      data: {
        name,
        groupCode,
        members: {
          create: {
            userId,
          },
        },
      },
    });

    return res.status(201).json(group);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function joinGroup(req, res) {
  try {
    const { groupCode } = req.body;
    const userId = req.user.id;

    const group = await prisma.savingsGroup.findUnique({
      where: { groupCode },
      include: { members: true },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.length >= 2) {
      return res.status(400).json({ message: "Group already full" });
    }

    const alreadyMember = group.members.find(
      (m) => m.userId === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already joined" });
    }

    await prisma.savingsMember.create({
      data: {
        userId,
        groupId: group.id,
      },
    });

    return res.json({ message: "Joined successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getGroupMembers(req, res) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
  
      // Cek apakah user termasuk member
      const membership = await prisma.savingsMember.findFirst({
        where: {
          groupId,
          userId,
        },
      });
  
      if (!membership) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      const members = await prisma.savingsMember.findMany({
        where: { groupId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
  
      return res.json({
        totalMembers: members.length,
        members: members.map((m) => m.user),
      });
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async function getMyGroups(req, res) {
    try {
      const userId = req.user.id;
  
      const memberships = await prisma.savingsMember.findMany({
        where: { userId },
        include: {
          group: {
            include: {
              transactions: true,
              members: {
                include: {
                  user: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      });
  
      const groups = memberships.map((m) => {
        const group = m.group;
  
        const totalBalance = group.transactions.reduce((acc, t) => {
          return t.type === "INCOME"
            ? acc + t.amount
            : acc - t.amount;
        }, 0);
  
        return {
          id: group.id,
          name: group.name,
          groupCode: group.groupCode,
          totalBalance,
          totalMembers: group.members.length,
          members: group.members.map((mem) => mem.user.name),
        };
      });
  
      return res.json(groups);
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }


  async function getGroupDetail(req, res) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
  
      const membership = await prisma.savingsMember.findFirst({
        where: { groupId, userId },
      });
  
      if (!membership) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      const group = await prisma.savingsGroup.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          transactions: true,
        },
      });
  
      const totalBalance = group.transactions.reduce((acc, t) => {
        return t.type === "INCOME"
          ? acc + t.amount
          : acc - t.amount;
      }, 0);
  
      return res.json({
        id: group.id,
        name: group.name,
        groupCode: group.groupCode,
        totalBalance,
        totalMembers: group.members.length,
        members: group.members.map((m) => m.user),
        totalTransactions: group.transactions.length,
      });
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
module.exports = {
  createGroup,
  joinGroup,
  getGroupMembers,
  getMyGroups,
  getGroupDetail
};