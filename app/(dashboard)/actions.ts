"use server"

import prisma from "@/lib/prisma"
import { MedicalHistoryStatus } from "@prisma/client"

export async function getDashboardMetrics() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const totalPatients = await prisma.patient.count()
  const todaysAppointments = await prisma.appointment.count({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  })
  const criticalAlerts = await prisma.medicalHistory.count({
    where: {
      status: MedicalHistoryStatus.CRITICAL,
    },
  })
  const activeProviders = await prisma.user.count({
    where: {
      role: "DOCTOR",
    },
  })

  return {
    totalPatients: { value: totalPatients, change: 23 }, // Mock change
    todaysAppointments: { value: todaysAppointments, change: 5 }, // Mock change
    criticalAlerts: { value: criticalAlerts, change: -2 }, // Mock change
    activeProviders: { value: activeProviders, change: 1 }, // Mock change
  }
}

export async function getRecentPatients(filter: string) {
  let whereClause: any = {}
  if (filter && filter !== "all") {
    whereClause = {
      medicalHistory: {
        some: {
          status: filter.toUpperCase() as MedicalHistoryStatus,
        },
      },
    }
  }

  const patients = await prisma.patient.findMany({
    where: whereClause,
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      medicalHistory: {
        orderBy: {
          diagnosisDate: "desc",
        },
        take: 1,
      },
    },
  })

  return patients.map((p) => {
    const latestHistory = p.medicalHistory?.[0]
    return {
      id: p.id,
      mrn: p.medicalRecordNumber,
      name: `${p.firstName} ${p.lastName}`,
      age: new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear(),
      lastVisit: new Date(p.createdAt).toLocaleDateString(),
      condition: latestHistory?.diagnosis || "N/A",
      status: latestHistory?.status || "unknown",
      riskLevel: latestHistory?.severity?.toLowerCase() || "low",
    }
  })
}

export async function getHealthcareTeam() {
  const providers = await prisma.user.findMany({
    where: {
      role: "DOCTOR",
    },
    take: 4,
    select: {
      id: true,
      name: true,
      role: true,
    },
  })

  // Mocking status and availability as they are not in the schema
  return providers.map((p) => ({
    id: p.id,
    name: p.name || "Unnamed Provider",
    role: p.role,
    status: Math.random() > 0.5 ? "online" : "offline",
    availability: "Available",
  }))
}