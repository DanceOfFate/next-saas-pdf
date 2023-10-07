"use client"
import {useState} from "react";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return(
      <Dialog
          open={isOpen}
          onOpenChange={(v) => {
              if (!v) {
                  setIsOpen(v);
              }
      }}>
          <DialogTrigger asChild>
              <Button onClick={() => setIsOpen(true)}>Upload PDF</Button>
          </DialogTrigger>
          <DialogContent>Example content</DialogContent>
      </Dialog>
  )
}

export default UploadButton;