"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  addAppointment,
  getPatientsForAppointment,
  getProvidersForAppointment,
} from "@/app/appointments/actions"
import { AppointmentStatus } from "@prisma/client"

interface ScheduleAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentScheduled: () => void
}

interface Patient {
  id: string
  name: string
}

interface Provider {
  id: string
  name: string | null
}

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  onAppointmentScheduled,
}: ScheduleAppointmentDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [patientsData, providersData] = await Promise.all([
          getPatientsForAppointment(),
          getProvidersForAppointment(),
        ])
        setPatients(patientsData)
        setProviders(providersData)
      } catch (error) {
        toast.error("Failed to load data for scheduling.")
        console.error("Error loading scheduling data:", error)
      }
    }
    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const result = await addAppointment(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success("Appointment scheduled successfully.")
      onAppointmentScheduled()
      onOpenChange(false)
      formRef.current?.reset()
    } else {
      toast.error("Could not schedule appointment", {
        description: result.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>Fill in the details to schedule a new appointment.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientId" className="text-right">
                Patient
              </Label>
              <select id="patientId" name="patientId" className="col-span-3" required>
                <option value="" disabled>
                  Select a patient
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="providerId" className="text-right">
                Provider
              </Label>
              <select id="providerId" name="providerId" className="col-span-3" required>
                <option value="" disabled>
                  Select a provider
                </option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date & Time
              </Label>
              <Input id="date" name="date" type="datetime-local" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={AppointmentStatus.BOOKED}
                className="col-span-3"
                required
              >
                <option value={AppointmentStatus.BOOKED}>Booked</option>
                <option value={AppointmentStatus.PENDING}>Pending</option>
                <option value={AppointmentStatus.ARRIVED}>Arrived</option>
                <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}