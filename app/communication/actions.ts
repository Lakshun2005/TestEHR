"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TaskStatus } from "@prisma/client"

// For demonstration, we'll get the first user to act as the current user.
// In a real app, this would come from the user's session.
async function getCurrentUser() {
  const user = await prisma.user.findFirst()
  if (!user) {
    throw new Error("No users found in the database.")
  }
  return user
}

// --- Message Actions ---

export async function getMessages() {
  const messages = await prisma.message.findMany({
    include: {
      sender: true,
      recipient: true,
    },
    orderBy: {
      timestamp: "asc",
    },
    take: 50, // Limit messages for performance
  })

  return messages.map((msg) => ({
    ...msg,
    timestamp: msg.timestamp.toISOString(),
    sender: {
      id: msg.sender.id,
      name: msg.sender.name || "Unknown User",
      role: msg.sender.role,
    },
    recipient: {
      id: msg.recipient.id,
      name: msg.recipient.name || "Unknown User",
      role: msg.recipient.role,
    },
  }))
}

export async function sendMessage(formData: FormData) {
  try {
    const sender = await getCurrentUser()
    const content = formData.get("content") as string
    const recipientId = formData.get("recipientId") as string

    if (!content || !recipientId) {
      throw new Error("Missing content or recipient.")
    }

    // In this simplified model, we'll send a message from the current user to the selected recipient.
    await prisma.message.create({
      data: {
        senderId: sender.id,
        recipientId: recipientId,
        content: content,
      },
    })

    revalidatePath("/communication")
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- Task Actions ---

export async function getTasks() {
  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return tasks.map((task) => ({
    ...task,
    description: task.description, // In the old component, this was the title.
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignedTo: {
      id: task.assignedTo.id,
      name: task.assignedTo.name || "Unknown User",
    },
  }))
}

export async function createTask(formData: FormData) {
  try {
    const assignedToId = formData.get("assignedToId") as string
    const description = formData.get("description") as string
    const dueDate = formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : undefined

    if (!description || !assignedToId) {
      throw new Error("Missing description or assignee.")
    }

    await prisma.task.create({
      data: {
        description,
        assignedToId,
        dueDate,
        status: TaskStatus.PENDING,
      },
    })

    revalidatePath("/communication")
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    })
    revalidatePath("/communication")
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- User Actions ---
export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  })
}