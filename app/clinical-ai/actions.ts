"use server"

import prisma from "@/lib/prisma"

export async function getPatientsForAIAssistant() {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      lastName: "asc",
    },
  })
  return patients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
  }))
}

export async function getPatientDetailsForAI(patientId: string) {
  if (!patientId) {
    return null
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      medicalHistory: {
        orderBy: {
          diagnosisDate: "desc",
        },
      },
    },
  })

  if (!patient) {
    return null
  }

  // Aggregate data for the AI assistant
  const history = patient.medicalHistory.map((h) => h.diagnosis).join(", ")
  const medications = patient.medicalHistory.map((h) => h.treatment).join(", ")

  return {
    age: (new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()).toString(),
    gender: patient.gender,
    medicalHistory: history,
    currentMedications: medications,
  }
}