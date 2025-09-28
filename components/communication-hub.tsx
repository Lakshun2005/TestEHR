"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, CheckSquare, Bell, Users, Send, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  getMessages,
  sendMessage,
  getTasks,
  createTask,
  updateTaskStatus,
  getUsers,
} from "@/app/communication/actions"
import { TaskStatus, User, Role } from "@prisma/client"

// Define types based on server action return shapes
type MessageWithSender = Awaited<ReturnType<typeof getMessages>>[0]
type TaskWithAssignee = Awaited<ReturnType<typeof getTasks>>[0]
type SelectableUser = Pick<User, "id" | "name" | "role">

export default function CommunicationHub() {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([])
  const [users, setUsers] = useState<SelectableUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("messages")

  // Form states
  const messageFormRef = useRef<HTMLFormElement>(null)
  const taskFormRef = useRef<HTMLFormElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [messagesData, tasksData, usersData] = await Promise.all([
        getMessages(),
        getTasks(),
        getUsers(),
      ])
      setMessages(messagesData)
      setTasks(tasksData)
      setUsers(usersData)
    } catch (error) {
      toast.error("Failed to load communication data.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (!formData.get("content") || !formData.get("recipientId")) {
      toast.warning("Message and recipient are required.")
      return
    }
    const result = await sendMessage(formData)
    if (result.success) {
      toast.success("Message sent.")
      messageFormRef.current?.reset()
      loadData()
    } else {
      toast.error("Failed to send message.", { description: result.message })
    }
  }

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (!formData.get("description") || !formData.get("assignedToId")) {
      toast.warning("Description and assignee are required.")
      return
    }
    const result = await createTask(formData)
    if (result.success) {
      toast.success("Task created.")
      taskFormRef.current?.reset()
      loadData()
    } else {
      toast.error("Failed to create task.", { description: result.message })
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const result = await updateTaskStatus(taskId, status)
    if (result.success) {
      toast.success(`Task status updated to ${status}.`)
      loadData()
    } else {
      toast.error("Failed to update task status.", { description: result.message })
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "PENDING":
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Communication Hub</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-2" />Messages</TabsTrigger>
          <TabsTrigger value="tasks"><CheckSquare className="h-4 w-4 mr-2" />Tasks</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Team Messages</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-96 mb-4 pr-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 mb-4">
                    <Avatar className="h-8 w-8"><AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <span className="font-medium text-sm">{message.sender.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{new Date(message.timestamp).toLocaleTimeString()}</span>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <form ref={messageFormRef} onSubmit={handleSendMessage} className="flex gap-2">
                <Input name="content" placeholder="Type your message..." required />
                <Select name="recipientId" required>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Recipient..." /></SelectTrigger>
                  <SelectContent>
                    {users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="submit"><Send className="h-4 w-4" /></Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Task Management</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{task.description}</p>
                      <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      <span>Assigned to: {task.assignedTo.name}</span>
                      {task.dueDate && <span className="ml-4">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}>Start</Button>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateTaskStatus(task.id, TaskStatus.COMPLETED)}>Complete</Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Create New Task</CardTitle></CardHeader>
            <CardContent>
              <form ref={taskFormRef} onSubmit={handleCreateTask} className="space-y-4">
                <Textarea name="description" placeholder="Task description..." required />
                <Select name="assignedToId" required>
                  <SelectTrigger><SelectValue placeholder="Assign to..." /></SelectTrigger>
                  <SelectContent>
                    {users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input name="dueDate" type="date" />
                <Button type="submit" className="w-full"><Plus className="h-4 w-4 mr-2" />Create Task</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}