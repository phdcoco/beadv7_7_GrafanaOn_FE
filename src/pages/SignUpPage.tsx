import { FormEvent, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { signUp } from "@/api/authApi"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    defaultShippingAddress: "",
    phoneNumber: "",
  })

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => navigate("/"),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    signUpMutation.mutate(form)
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Enter the profile information required by Auth.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              type="email"
              placeholder="email@example.com"
              required
            />
            <Input
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              type="password"
              placeholder="Password"
              required
            />
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Name"
              required
            />
            <Input
              value={form.defaultShippingAddress}
              onChange={(event) =>
                updateField("defaultShippingAddress", event.target.value)
              }
              placeholder="Default shipping address"
              required
            />
            <Input
              value={form.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              placeholder="Phone number"
              required
            />
            {signUpMutation.isError && (
              <p className="text-sm text-red-600">
                Sign up failed. Please check the request values.
              </p>
            )}
            <Button className="w-full" disabled={signUpMutation.isPending}>
              {signUpMutation.isPending ? "Creating..." : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
