"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Users,
  Calendar,
  AlertTriangle,
  Stethoscope,
  MoreHorizontal,
  UserPlus,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  FileClock,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Activity,
  Clock,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { toast } from "sonner"

import { AddPatientDialog } from "@/components/add-patient-dialog"
import { EditPatientDialog } from "@/components/edit-patient-dialog"
import { getDashboardMetrics, getRecentPatients, getHealthcareTeam } from "./actions"
import { deletePatient } from "@/app/patients/actions"
import type { PatientWithDetails } from "@/app/patients/page"

// Mock data for the chart
const patientVitalsData = [
  { month: "Jul", patients: 1180, appointments: 890, alerts: 12 },
  { month: "Aug", patients: 1205, appointments: 920, alerts: 8 },
  { month: "Sep", patients: 1220, appointments: 945, alerts: 15 },
  { month: "Oct", patients: 1235, appointments: 980, alerts: 6 },
  { month: "Nov", patients: 1240, appointments: 1020, alerts: 9 },
  { month: "Dec", patients: 1247, appointments: 1050, alerts: 5 },
]

// Define types for our data
type Metric = { value: number; change: number }
type DashboardMetrics = {
  totalPatients: Metric
  todaysAppointments: Metric
  criticalAlerts: Metric
  activeProviders: Metric
}
type RecentPatient = {
  id: string
  mrn: string
  name: string
  age: number
  lastVisit: string
  condition: string
  status: string
  riskLevel: string
}
type TeamMember = {
  id: string
  name: string
  role: string
  status: string
  availability: string
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 days")
  const [patients, setPatients] = useState<RecentPatient[]>([])
  const [providers, setProviders] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false)
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientWithDetails | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPatients: { value: 0, change: 0 },
    todaysAppointments: { value: 0, change: 0 },
    criticalAlerts: { value: 0, change: 0 },
    activeProviders: { value: 0, change: 0 },
  })

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [metricsData, patientsData, providersData] = await Promise.all([
        getDashboardMetrics(),
        getRecentPatients(activeFilter),
        getHealthcareTeam(),
      ])
      setMetrics(metricsData)
      setPatients(patientsData as any) // Cast to any to avoid type conflicts with dialogs
      setProviders(providersData)
    } catch (error) {
      toast.error("Failed to load dashboard data.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handlePatientAddedOrUpdated = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleEditPatient = (patient: RecentPatient) => {
    // We need to pass the full patient object to the dialog, but we only have a summary.
    // In a real app, we might fetch the full details here or pass them differently.
    // For now, we'll cast and pass what we have.
    setSelectedPatient(patient as unknown as PatientWithDetails)
    setEditPatientDialogOpen(true)
  }

  const handleDelete = async (patientId: string) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return

    const result = await deletePatient(patientId)
    if (result.success) {
      toast.success("Patient deleted successfully.")
      loadDashboardData()
    } else {
      toast.error("Failed to delete patient.", { description: result.message })
    }
  }

  const metricsCards = [
    { label: "Total Patients", data: metrics.totalPatients, icon: Users, trend: "up" },
    { label: "Today's Appointments", data: metrics.todaysAppointments, icon: Calendar, trend: "up" },
    { label: "Critical Alerts", data: metrics.criticalAlerts, icon: AlertTriangle, trend: "down" },
    { label: "Active Providers", data: metrics.activeProviders, icon: Stethoscope, trend: "up" },
  ]

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case "high": return "border-chart-4 text-chart-4"
      case "medium": return "border-chart-3 text-chart-3"
      default: return "border-chart-2 text-chart-2"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "CRITICAL":
        return { variant: "destructive", icon: AlertTriangle, label: "Critical", className: "bg-chart-4/10 text-chart-4" }
      default:
        return { variant: "secondary", icon: Activity, label: "Stable", className: "bg-chart-2/10 text-chart-2" }
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor patient care and clinical workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddPatientDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {metricsCards.map((metric, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-chart-2' : 'text-chart-4'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.data.change > 0 ? `+${metric.data.change}` : metric.data.change}
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{metric.data.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* Chart */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Patient Care Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientVitalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Patient Table */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
                <Link href="/patients"><Button variant="outline" size="sm">View All</Button></Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : (
                    patients.map((patient) => {
                      const statusInfo = getStatusBadge(patient.status)
                      return (
                        <TableRow key={patient.id}>
                          <TableCell>{patient.name}</TableCell>
                          <TableCell>{patient.condition}</TableCell>
                          <TableCell><Badge variant={statusInfo.variant} className={statusInfo.className}>{statusInfo.label}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className={getRiskLevelBadge(patient.riskLevel)}>{patient.riskLevel}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditPatient(patient)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(patient.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-1 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-4"><CardTitle>Healthcare Team</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                providers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-4 border-b last:border-b-0">
                    <Avatar><AvatarImage /><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <div>{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AddPatientDialog
        open={isAddPatientDialogOpen}
        onOpenChange={setAddPatientDialogOpen}
        onPatientAdded={handlePatientAddedOrUpdated}
      />
      {selectedPatient && (
        <EditPatientDialog
          patient={selectedPatient}
          open={isEditPatientDialogOpen}
          onOpenChange={setEditPatientDialogOpen}
          onPatientUpdated={handlePatientAddedOrUpdated}
        />
      )}
    </>
  )
}