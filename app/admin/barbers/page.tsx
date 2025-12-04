"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Plus, User, Scissors, Award, ArrowLeft, Key } from "lucide-react"
import { useRouter } from "next/navigation"

interface Barber {
  _id: string
  name: string
  specialty: string
  image_url: string
  bio: string
  experience_years: number
  username: string
  created_at: string
}

export default function BarbersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialog, setAddDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    image_url: "",
    bio: "",
    experience_years: 0,
    username: "",
    password: "",
  })

  const fetchBarbers = async () => {
    try {
      const response = await fetch("/api/barbers")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBarbers(data)
    } catch (error) {
      console.error("[v0] Error fetching barbers:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się załadować barberów",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBarbers()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      specialty: "",
      image_url: "",
      bio: "",
      experience_years: 0,
      username: "",
      password: "",
    })
  }

  const handleAdd = () => {
    resetForm()
    setAddDialog(true)
  }

  const handleCreate = async () => {
    try {
      console.log("[v0] Creating barber with data:", formData)

      const response = await fetch("/api/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Dodano",
          description: "Nowy barber został dodany",
        })
        setAddDialog(false)
        resetForm()
        fetchBarbers()
      } else {
        const errorData = await response.json()
        console.error("[v0] Create failed:", errorData)
        throw new Error(errorData.error || errorData.details || "Failed to create barber")
      }
    } catch (error) {
      console.error("[v0] Error creating barber:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się dodać barbera",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (barber: Barber) => {
    setSelectedBarber(barber)
    setFormData({
      name: barber.name,
      specialty: barber.specialty,
      image_url: barber.image_url || "",
      bio: barber.bio || "",
      experience_years: barber.experience_years || 0,
      username: barber.username,
      password: "", // Leave password empty for security
    })
    setEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!selectedBarber) return

    try {
      console.log("[v0] Updating barber with data:", formData)

      const response = await fetch(`/api/barbers/${selectedBarber._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Zaktualizowano",
          description: "Dane barbera zostały zaktualizowane",
        })
        setEditDialog(false)
        fetchBarbers()
      } else {
        const errorData = await response.json()
        console.error("[v0] Update failed:", errorData)
        throw new Error(errorData.error || errorData.details || "Failed to update barber")
      }
    } catch (error) {
      console.error("[v0] Error updating barber:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zaktualizować danych",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedBarber) return

    try {
      const response = await fetch(`/api/barbers/${selectedBarber._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Usunięto",
          description: "Barber został usunięty",
        })
        setDeleteDialog(false)
        fetchBarbers()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete barber")
      }
    } catch (error) {
      console.error("[v0] Error deleting barber:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć barbera",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Powrót do panelu admina
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Zarządzanie barberami</h1>
          <p className="text-muted-foreground">Dodawaj, edytuj i zarządzaj zespołem barberów</p>
        </div>
        <Button onClick={handleAdd} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Plus className="w-4 h-4" />
          Dodaj barbera
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
      ) : barbers.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Brak barberów w systemie</p>
          <Button onClick={handleAdd} variant="outline">
            Dodaj pierwszego barbera
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div key={barber._id} className="border rounded-lg overflow-hidden flex flex-col h-full bg-card">
              <div className="relative h-64 bg-black flex-shrink-0 m-0 p-0">
                <img
                  src={barber.image_url || "/placeholder.svg"}
                  alt={barber.name}
                  className="w-full h-full object-cover object-center-top"
                  style={{ objectPosition: "center 25%" }}
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground z-10">
                  {barber.experience_years} lat
                </Badge>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4 flex-shrink-0">
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2 mb-2">
                    <User className="w-5 h-5" />
                    {barber.name}
                  </h3>
                  <p className="text-accent font-medium">{barber.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Login: {barber.username}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">{barber.bio}</p>
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(barber)} className="flex-1">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBarber(barber)
                      setDeleteDialog(true)
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Dodaj nowego barbera</DialogTitle>
            <DialogDescription>Wprowadź dane nowego członka zespołu</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">
                <User className="w-4 h-4 inline mr-2" />
                Imię i nazwisko *
              </Label>
              <Input
                id="add-name"
                placeholder="Jan Kowalski"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-username">
                <Key className="w-4 h-4 inline mr-2" />
                Nazwa użytkownika *
              </Label>
              <Input
                id="add-username"
                placeholder="barber1"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">
                Hasło *
              </Label>
              <Input
                id="add-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-specialty">
                <Scissors className="w-4 h-4 inline mr-2" />
                Specjalizacja *
              </Label>
              <Input
                id="add-specialty"
                placeholder="Klasyczne strzyżenia męskie"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-experience">
                <Award className="w-4 h-4 inline mr-2" />
                Lata doświadczenia *
              </Label>
              <Input
                id="add-experience"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-image">URL zdjęcia</Label>
              <Input
                id="add-image"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Możesz użyć URL zdjęcia lub pozostawić puste dla domyślnego
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-bio">Biografia *</Label>
              <Textarea
                id="add-bio"
                placeholder="Krótki opis doświadczenia i umiejętności..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Dodaj barbera
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Edytuj dane barbera</DialogTitle>
            <DialogDescription>Zaktualizuj informacje o członku zespołu</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                <User className="w-4 h-4 inline mr-2" />
                Imię i nazwisko *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">
                <Key className="w-4 h-4 inline mr-2" />
                Nazwa użytkownika *
              </Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Nowe hasło
              </Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Pozostaw puste aby nie zmieniać"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Wprowadź nowe hasło tylko jeśli chcesz je zmienić
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialty">
                <Scissors className="w-4 h-4 inline mr-2" />
                Specjalizacja *
              </Label>
              <Input
                id="edit-specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-experience">
                <Award className="w-4 h-4 inline mr-2" />
                Lata doświadczenia *
              </Label>
              <Input
                id="edit-experience"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">URL zdjęcia</Label>
              <Input
                id="edit-image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Biografia *</Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleUpdate} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tego barbera? Ta akcja jest nieodwracalna.
              {selectedBarber && <span className="block mt-2 font-medium text-foreground">{selectedBarber.name}</span>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}