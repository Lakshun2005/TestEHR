"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPatientsForDocumentation() {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      medicalRecordNumber: true,
    },
    orderBy: {
      lastName: "asc",
    },
  })
  return patients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName} (MRN: ${p.medicalRecordNumber})`,
  }))
}

// In a real application, the author's ID would come from the user's session.
// For this refactoring, we'll fetch the first available doctor to act as the author.
export async function getFirstDoctor() {
  return prisma.user.findFirst({
    where: {
      role: "DOCTOR",
    },
  })
}

export async function saveClinicalNote(formData: FormData) {
  try {
    const noteData = {
      patientId: formData.get("patientId") as string,
      authorId: formData.get("authorId") as string,
      type: formData.get("type") as string,
      content: formData.get("content") as string,
    }

    if (!noteData.patientId || !noteData.authorId || !noteData.type || !noteData.content) {
      throw new Error("Missing required fields to save the clinical note.")
    }

    await prisma.clinicalNote.create({
      data: noteData,
    })

    revalidatePath("/documentation") // Or a more specific path if needed
    return { success: true, message: "Clinical note saved successfully." }
  } catch (error: any) {
    console.error("Failed to save clinical note:", error)
    return { success: false, message: error.message || "Failed to save note." }
  }
}