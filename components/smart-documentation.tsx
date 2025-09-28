"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Mic,
  MicOff,
  Download,
  Copy,
  Save,
  Loader2,
  Brain,
  ClipboardList,
  FileCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { getPatientsForDocumentation, getFirstDoctor, saveClinicalNote } from "@/app/documentation/actions"
import { User } from "@prisma/client"

interface PatientSelectItem {
  id: string
  name: string
}

interface DocumentationTemplate {
  id: string
  name: string
  type: string
  description: string
  fields: string[]
}

const documentationTemplates: DocumentationTemplate[] = [
  // ... (template data remains the same)
]

export function SmartDocumentation() {
  const [activeTab, setActiveTab] = useState("generate")
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [generatedNote, setGeneratedNote] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // State for fetched data
  const [patients, setPatients] = useState<PatientSelectItem[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>()
  const [author, setAuthor] = useState<User | null>(null)

  // Form states for SOAP note generation
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [vitals, setVitals] = useState("")
  const [examination, setExamination] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [patientsData, authorData] = await Promise.all([
          getPatientsForDocumentation(),
          getFirstDoctor(),
        ])
        setPatients(patientsData)
        setAuthor(authorData)
      } catch (error) {
        toast.error("Failed to load initial data.")
        console.error("Data loading error:", error)
      }
    }
    loadInitialData()
  }, [])

  const handleGenerateSOAP = async () => {
    // This function still calls the mock API as per the original design.
    // The focus of this refactoring is on saving the note.
    const selectedPatient = patients.find(p => p.id === selectedPatientId)
    if (!selectedPatient) {
      toast.warning("Please select a patient before generating a note.")
      return
    }

    setLoading(true)
    // Mock generation logic...
    setTimeout(() => {
      const note = `
SOAP Note for ${selectedPatient.name}
Date: ${new Date().toLocaleDateString()}

S: Patient presents with a chief complaint of ${chiefComplaint}. Reported symptoms include ${symptoms}.
O: Vitals: ${vitals}. Physical exam findings: ${examination}.
A: ${diagnosis}.
P: ${treatment}.
      `.trim()
      setGeneratedNote(note)
      setLoading(false)
      toast.success("SOAP Note Generated (Mock)")
    }, 1000)
  }

  const handleSaveNote = async () => {
    if (!selectedPatientId || !author || !generatedNote) {
      toast.error("Cannot save note.", {
        description: "A patient must be selected and a note must be generated.",
      })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("patientId", selectedPatientId)
    formData.append("authorId", author.id)
    formData.append("type", "SOAP Note") // Assuming SOAP note for now
    formData.append("content", generatedNote)

    const result = await saveClinicalNote(formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error("Failed to save note", {
        description: result.message,
      })
    }
  }

  const handleCopyNote = () => {
    navigator.clipboard.writeText(generatedNote)
    toast.info("Copied to Clipboard")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Smart Documentation System</h2>
          <p className="text-muted-foreground">AI-powered clinical documentation and note generation</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Notes</TabsTrigger>
          <TabsTrigger value="voice" disabled>Voice (Coming Soon)</TabsTrigger>
          <TabsTrigger value="extract" disabled>Extract (Coming Soon)</TabsTrigger>
          <TabsTrigger value="templates" disabled>Templates (Coming Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Patient Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Select a patient for this note</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger id="patient-select">
                      <SelectValue placeholder="Select a patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chief-complaint">Chief Complaint</Label>
                  <Input
                    id="chief-complaint"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Patient's main concern"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Clinical Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Information</CardTitle>
                <CardDescription>Enter clinical findings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Patient reported symptoms..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vitals">Vital Signs (JSON)</Label>
                  <Textarea
                    id="vitals"
                    value={vitals}
                    onChange={(e) => setVitals(e.target.value)}
                    placeholder='{"bp": "120/80", "hr": 72}'
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment & Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment & Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examination">Physical Examination</Label>
                <Textarea
                  id="examination"
                  value={examination}
                  onChange={(e) => setExamination(e.target.value)}
                  placeholder="Physical exam findings..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Assessment/Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Clinical assessment and diagnosis..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment Plan</Label>
                <Textarea
                  id="treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Treatment plan, medications, follow-up..."
                  rows={3}
                />
              </div>
              <Button onClick={handleGenerateSOAP} disabled={loading || !selectedPatientId} className="w-full">
                {loading ? "Generating..." : "Generate SOAP Note"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Note Card */}
      {generatedNote && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Clinical Note</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyNote}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={loading || !selectedPatientId}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save to Patient Record"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedNote}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}