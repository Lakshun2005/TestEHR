"use client"

import { useState, useEffect, useCallback } from "react"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScheduleAppointmentDialog } from "@/components/schedule-appointment-dialog"
import { getAppointments } from "./actions"
import { Appointment, Patient, User, AppointmentStatus } from "@prisma/client"
import { toast } from "sonner"

// Define a detailed type for appointments
export type AppointmentWithDetails = Appointment & {
  patientName: string
  providerName: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [isScheduleAppointmentDialogOpen, setIsScheduleAppointmentDialogOpen] = useState(false)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAppointments()
      setAppointments(data)
    } catch (error) {
      console.error("Error loading appointments:", error)
      toast.error("Failed to load appointments.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStatusVariant = (status: AppointmentStatus) => {
    switch (status) {
      case "BOOKED":
        return "default"
      case "ARRIVED":
        return "success"
      case "CANCELLED":
        return "destructive"
      case "PENDING":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <>
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage all patient appointments</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsScheduleAppointmentDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upcoming & Past Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium text-foreground">Date & Time</TableHead>
                  <TableHead className="font-medium text-foreground">Patient</TableHead>
                  <TableHead className="font-medium text-foreground">Provider</TableHead>
                  <TableHead className="font-medium text-foreground">Status</TableHead>
                  <TableHead className="font-medium text-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading appointments...
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appt) => (
                    <TableRow key={appt.id} className="hover:bg-muted/50">
                      <TableCell>{formatDateTime(appt.date)}</TableCell>
                      <TableCell>{appt.patientName}</TableCell>
                      <TableCell>{`Dr. ${appt.providerName}`}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(appt.status)}>{appt.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <ScheduleAppointmentDialog
        open={isScheduleAppointmentDialogOpen}
        onOpenChange={setIsScheduleAppointmentDialogOpen}
        onAppointmentScheduled={loadAppointments}
      />
    </>
  )
}