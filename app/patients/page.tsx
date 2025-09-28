"use client"

import { useState, useEffect, useCallback } from "react"
import { MoreHorizontal, UserPlus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { EditPatientDialog } from "@/components/edit-patient-dialog"
import { ViewPatientDialog } from "@/components/view-patient-dialog"
import { toast } from "sonner"
import { getPatients, deletePatient } from "./actions"
import { Patient, MedicalHistory, MedicalHistoryStatus, Severity } from "@prisma/client"

// Define the type for the patient data returned by the server action
export type PatientWithDetails = Patient & {
  name: string
  age: number
  lastVisit: string
  status: MedicalHistoryStatus | "unknown"
  riskLevel: Severity | "unknown"
  medicalHistory: MedicalHistory[]
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false)
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false)
  const [isViewPatientDialogOpen, setIsViewPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientWithDetails | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPatients(searchTerm)
      setPatients(data)
    } catch (error) {
      console.error("Error loading patients:", error)
      toast.error("Failed to load patients.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPatients()
    }, 500) // Debounce search input

    return () => clearTimeout(debounceTimer)
  }, [loadPatients])

  const handlePatientAdded = useCallback(() => {
    loadPatients()
  }, [loadPatients])

  const handlePatientUpdated = useCallback(() => {
    loadPatients()
  }, [loadPatients])

  const handleDelete = async (patientId: string) => {
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return
    }

    const result = await deletePatient(patientId)

    if (result.success) {
      toast.success("Patient deleted successfully.")
      loadPatients() // Refresh the list
    } else {
      toast.error("Failed to delete patient.", {
        description: result.message,
      })
    }
  }

  const handleViewDetails = (patient: PatientWithDetails) => {
    setSelectedPatient(patient)
    setIsViewPatientDialogOpen(true)
  }

  const handleEditPatient = (patient: PatientWithDetails) => {
    setSelectedPatient(patient)
    setIsEditPatientDialogOpen(true)
  }

  return (
    <>
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Patient Directory</h1>
            <p className="text-muted-foreground mt-1">Manage all patients in the system</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddPatientDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search by name or MRN..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium text-foreground">MRN</TableHead>
                  <TableHead className="font-medium text-foreground">Patient Name</TableHead>
                  <TableHead className="font-medium text-foreground">Age</TableHead>
                  <TableHead className="font-medium text-foreground">Last Visit</TableHead>
                  <TableHead className="font-medium text-foreground">Status</TableHead>
                  <TableHead className="font-medium text-foreground">Risk Level</TableHead>
                  <TableHead className="font-medium text-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading patients...
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.age}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.lastVisit}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            patient.status === "STABLE"
                              ? "default"
                              : patient.status === "CRITICAL"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            patient.riskLevel === "HIGH"
                              ? "destructive"
                              : patient.riskLevel === "MEDIUM"
                              ? "warning"
                              : "default"
                          }
                        >
                          {patient.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          open={openMenuId === patient.id}
                          onOpenChange={(isOpen) => setOpenMenuId(isOpen ? patient.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleViewDetails(patient)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleEditPatient(patient)}>
                              Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleDelete(patient.id)}
                              className="text-red-600"
                            >
                              Delete Patient
                            </DropdownMenuItem>
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
      <AddPatientDialog
        open={isAddPatientDialogOpen}
        onOpenChange={setIsAddPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
      />
      {selectedPatient && (
        <ViewPatientDialog
          key={`view-${selectedPatient.id}`}
          patient={selectedPatient}
          open={isViewPatientDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedPatient(null)
            setIsViewPatientDialogOpen(isOpen)
          }}
        />
      )}
      {selectedPatient && (
        <EditPatientDialog
          key={`edit-${selectedPatient.id}`}
          patient={selectedPatient}
          open={isEditPatientDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedPatient(null)
            setIsEditPatientDialogOpen(isOpen)
          }}
          onPatientUpdated={handlePatientUpdated}
        />
      )}
    </>
  )
}