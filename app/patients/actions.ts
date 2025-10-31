"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPatients(searchTerm: string) {
  const where = searchTerm
    ? {
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { medicalRecordNumber: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    : {}

  const patients = await prisma.patient.findMany({
    where,
    include: {
      medicalHistory: {
        orderBy: {
          diagnosisDate: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Transform data for UI, ensuring it's serializable
  return patients.map((patient) => {
    const { dateOfBirth, createdAt, updatedAt, medicalHistory, ...restOfPatient } = patient;
    return {
      ...restOfPatient,
      dateOfBirth: dateOfBirth.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      name: `${patient.firstName} ${patient.lastName}`,
      mrn: patient.medicalRecordNumber,
      age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
      lastVisit: new Date(patient.createdAt).toISOString().split("T")[0],
      status: medicalHistory[0]?.status ?? "unknown",
      riskLevel: medicalHistory[0]?.severity ?? "unknown",
      // Pass the serializable medical history
      medicalHistory: medicalHistory.map(h => ({
        ...h,
        diagnosisDate: h.diagnosisDate.toISOString(),
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
      })),
    }
  })
}

export async function deletePatient(patientId: string) {
  try {
    // Manually delete related records since cascade delete is not configured
    await prisma.appointment.deleteMany({ where: { patientId } })
    await prisma.medicalHistory.deleteMany({ where: { patientId } })
    await prisma.clinicalNote.deleteMany({ where: { patientId } })
    await prisma.document.deleteMany({ where: { patientId } })

    await prisma.patient.delete({
      where: { id: patientId },
    })

    revalidatePath("/patients")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete patient:", error)
    return { success: false, message: error.message || "Failed to delete patient." }
  }
}

export async function addPatient(formData: FormData) {
  try {
    const newPatient = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dateOfBirth: new Date(formData.get("dateOfBirth") as string),
      gender: formData.get("gender") as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN",
      medicalRecordNumber: `MRN${Date.now()}`, // Simple unique MRN
    }

    await prisma.patient.create({
      data: newPatient,
    })

    revalidatePath("/patients")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to add patient:", error)
    if (error.code === "P1001") {
      return { success: false, message: "Could not connect to the database. Please check your connection and try again." }
    }
    return { success: false, message: error.message || "Failed to add patient." }
  }
}

export async function updatePatient(patientId: string, formData: FormData) {
  try {
    const updatedPatient = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dateOfBirth: new Date(formData.get("dateOfBirth") as string),
      gender: formData.get("gender") as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN",
    }

    await prisma.patient.update({
      where: { id: patientId },
      data: updatedPatient,
    })

    revalidatePath("/patients")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update patient:", error)
    return { success: false, message: error.message || "Failed to update patient." }
  }
}