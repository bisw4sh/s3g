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

interface UserImageModalProps {
  user: User
  isOpen: boolean
  onCloseAction: () => void
}

export default function UserImageModal({ user, isOpen, onCloseAction }: UserImageModalProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {user.name || user.email}&apos;s Images
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
              <h3 className="font-semibold">{user.name || "No name"}</h3>
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
          </div>

          {/* Image URLs (for debugging/reference) */}
          {(user.image || user.coverUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Image URLs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.image && (
                  <div>
                    <p className="text-sm font-medium">Profile:</p>
                    <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
                      {user.image}
                    </p>
                  </div>
                )}
                {user.coverUrl && (
                  <div>
                    <p className="text-sm font-medium">Cover:</p>
                    <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
                      {user.coverUrl}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
