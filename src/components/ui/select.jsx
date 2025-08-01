"use client"

import React, { useState } from "react"

export const Select = ({ value, onValueChange, children }) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => React.cloneElement(child, { value, onValueChange }))}
    </div>
  )
}

export const SelectTrigger = ({ className = "", children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {React.Children.map(children, (child) => {
            if (child.type === SelectContent) {
              return React.cloneElement(child, {
                value,
                onValueChange: (newValue) => {
                  onValueChange(newValue)
                  setIsOpen(false)
                },
              })
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

export const SelectValue = ({ placeholder }) => <span className="text-gray-500">{placeholder}</span>

export const SelectContent = ({ children, value, onValueChange }) => (
  <div className="p-1">
    {React.Children.map(children, (child) => React.cloneElement(child, { value, onValueChange }))}
  </div>
)

export const SelectItem = ({ value: itemValue, children, value, onValueChange }) => (
  <div
    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 ${
      value === itemValue ? "bg-blue-100 text-blue-900" : ""
    }`}
    onClick={() => onValueChange(itemValue)}
  >
    {children}
  </div>
)
