"use client"
import { User } from "@/db/schema"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User as UserIcon, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { EUserRole } from "@/types/common/roles"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface UserImageModalProps {
  user: User
  isOpen: boolean
  onCloseAction: () => void
}

const roleSchema = z.object({
  role: z.nativeEnum(EUserRole)
})

const actionSchema = z.object({
  action: z.enum(["ban", "delete", "impersonate"])
})

type TAction = z.infer<typeof actionSchema>
type TRole = z.infer<typeof roleSchema>

export default function UserImageModal({ user, isOpen, onCloseAction }: UserImageModalProps) {
  const queryClient = useQueryClient();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
  })

  const actionForm = useForm<z.infer<typeof actionSchema>>({
    resolver: zodResolver(actionSchema)
  })

  const onRoleFormSubmit = async (values: TRole) => {
    try {
      await authClient.admin.setRole({
        userId: user.id,
        role: values.role,
      });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Successfully updated role");
    } catch (error) {
      console.error(error);
      toast.error("Couldn't update the role");
    }
  }
  const onActionFormSubmit = async (values: TAction) => {
    try {
      switch (values.action) {
        case "ban":
          await authClient.admin.banUser({
            userId: user.id,
            banReason: "Admin decided",
          });
          break;

        case "impersonate":
          await authClient.admin.impersonateUser({
            userId: user.id,
          });
          break;

        case "delete":
          await authClient.admin.removeUser({
            userId: user.id,
          });
          break;

        default:
      }

      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast(`${values.action} successfully`)
    } catch (error) {
      console.error(error)
      toast.error(`couldn't complete the ${values.action} action`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {user.name || user.email}&apos;s Panel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              {user?.image ? <AvatarImage src={user.image} alt={user.name || "User"} /> : null}
              <AvatarFallback>
                {user.name ? getInitials(user.name) : <UserIcon className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div>

              <h3 className="font-semibold">{user.name || "No name"} {` [${user?.role}]`}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserIcon className="h-4 w-4" />
                  Profile Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-muted-foreground">
                      <UserIcon className="h-12 w-12" />
                      <p className="text-sm">No profile image</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4" />
                  Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                  {user.coverUrl ? (
                    <Image
                      src={user.coverUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-muted-foreground">
                      <ImageIcon className="h-12 w-12" />
                      <p className="text-sm">No cover image</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Form {...roleForm} >
              <form onSubmit={roleForm.handleSubmit(onRoleFormSubmit)} className="space-y-8 col-span-2">
                <FormField
                  control={roleForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="ROLES" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Pick the role for the user</SelectLabel>
                              <SelectItem value={EUserRole.USER} className="cursor-pointer">User</SelectItem>
                              <SelectItem value={EUserRole.ADMIN} className="cursor-pointer">Admin</SelectItem>
                              {/* <SelectItem value={EUserRole.MOD} className="cursor-pointer">Moderator</SelectItem> */}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="cursor-pointer w-full row-span-2">Change role</Button>
              </form>
            </Form>          </div>

          <Separator />

          <Form {...actionForm} >
            <form onSubmit={actionForm.handleSubmit(onActionFormSubmit)} className="space-y-8 col-span-2">
              <FormField
                control={actionForm.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row justify-around items-center">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ban" id="ban" />
                          <Label htmlFor="ban">Ban User</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delete" id="delete" />
                          <Label htmlFor="delete">Delete User</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="impersonate" id="impersonate" />
                          <Label htmlFor="impersonate">Impersonate User</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="cursor-pointer w-full row-span-2" variant="destructive">Act</Button>
            </form>
          </Form>

        </div>
      </DialogContent>
    </Dialog>
  )
}
