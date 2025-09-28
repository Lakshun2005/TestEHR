"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { AppointmentStatus } from "@prisma/client"

export async function getAppointments() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true, // Include the full patient record
      provider: true, // Include the full user (provider) record
    },
    orderBy: {
      date: "desc",
    },
  })

  // Transform data for UI, ensuring it's serializable
  return appointments.map((appt) => ({
    ...appt,
    date: appt.date.toISOString(),
    createdAt: appt.createdAt.toISOString(),
    updatedAt: appt.updatedAt.toISOString(),
    patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
    providerName: appt.provider.name || "N/A",
  }))
}

export async function getPatientsForAppointment() {
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

export async function getProvidersForAppointment() {
  const providers = await prisma.user.findMany({
    where: {
      role: "DOCTOR", // Assuming only doctors can be providers
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  })
  return providers
}

export async function addAppointment(formData: FormData) {
  try {
    const newAppointment = {
      patientId: formData.get("patientId") as string,
      providerId: formData.get("providerId") as string,
      date: new Date(formData.get("date") as string),
      status: (formData.get("status") as AppointmentStatus) || AppointmentStatus.BOOKED,
    }

    if (!newAppointment.patientId || !newAppointment.providerId || !newAppointment.date) {
      throw new Error("Missing required fields.")
    }

    await prisma.appointment.create({
      data: newAppointment,
    })

    revalidatePath("/appointments")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to add appointment:", error)
    return { success: false, message: error.message || "Failed to schedule appointment." }
  }
}