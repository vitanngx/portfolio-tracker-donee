"use client"

import React, { createContext, useContext, useState } from "react"

const DialogContext = createContext()

export const Dialog = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return <DialogContext.Provider value={{ isOpen, setIsOpen }}>{children}</DialogContext.Provider>
}

export const DialogTrigger = ({ asChild, children }) => {
  const { setIsOpen } = useContext(DialogContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(true),
    })
  }

  return <button onClick={() => setIsOpen(true)}>{children}</button>
}

export const DialogContent = ({ className = "", children }) => {
  const { isOpen, setIsOpen } = useContext(DialogContext)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className={`relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 ${className}`}>
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

export const DialogHeader = ({ className = "", children }) => <div className={`mb-4 ${className}`}>{children}</div>

export const DialogTitle = ({ className = "", children }) => (
  <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
)

export const DialogDescription = ({ className = "", children }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
)
