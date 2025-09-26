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

export function ViewPatientDialog({ patient, open, onOpenChange }) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>
            Viewing patient record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">MRN</Label>
            <p className="col-span-3">{patient.mrn}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Name</Label>
            <p className="col-span-3">{patient.name}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Age</Label>
            <p className="col-span-3">{patient.age}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Last Visit</Label>
            <p className="col-span-3">{patient.lastVisit}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Status</Label>
            <p className="col-span-3">{patient.status}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Risk Level</Label>
            <p className="col-span-3">{patient.riskLevel}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}