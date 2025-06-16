import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function UsersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* <h1 className="text-xl font-bold">User Management</h1>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button> */}
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 sm:max-w-sm">
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] w-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
