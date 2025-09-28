"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { PatientWithDetails } from "@/app/patients/page"

interface ViewPatientDialogProps {
  patient: PatientWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPatientDialog({ patient, open, onOpenChange }: ViewPatientDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>Viewing record for {patient.name}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">MRN</Label>
            <p className="col-span-2 font-mono text-sm">{patient.mrn}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Name</Label>
            <p className="col-span-2">{patient.name}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Age</Label>
            <p className="col-span-2">{patient.age}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Date of Birth</Label>
            <p className="col-span-2">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Gender</Label>
            <p className="col-span-2 capitalize">{patient.gender.toLowerCase()}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Last Visit</Label>
            <p className="col-span-2">{patient.lastVisit}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Status</Label>
            <div className="col-span-2">
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
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right font-semibold">Risk Level</Label>
            <div className="col-span-2">
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}