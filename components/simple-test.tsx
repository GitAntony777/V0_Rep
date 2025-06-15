"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SimpleTest() {
  const [name, setName] = useState("")
  const [items, setItems] = useState<string[]>([])

  const addItem = () => {
    if (name.trim()) {
      setItems([...items, name])
      setName("")
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Απλό Τεστ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Όνομα</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Εισάγετε όνομα" />
          </div>

          <Button onClick={addItem} className="w-full">
            Προσθήκη
          </Button>

          <div className="space-y-2">
            <h3 className="font-medium">Λίστα:</h3>
            {items.length === 0 ? (
              <p className="text-gray-500">Κενή λίστα</p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  {index + 1}. {item}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
