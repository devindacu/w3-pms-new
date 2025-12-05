import { useState, useEffect, useMemo } from 'react'
  Comman
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
} from '@/compo
  CommandItem,
  Receipt,
  Phone,
  MapPin,
  Calendar,
  Bed
import type { Gues
import 
interface Global
  Receipt,
  XCircle,
  Phone,
  EnvelopeSimple,
  MapPin,
  CurrencyDollar,
  Calendar,
  IdentificationCard,
  Bed
} from '@phosphor-icons/react'
import type { Guest, Reservation, GuestInvoice, GuestProfile } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { format } from 'date-fns'

interface GlobalSearchProps {
  guests: Guest[]
      }

    return () => document.

 


      const 
        profile.lastName,
        profile
        profile.na
      ].filter(B
      if (matchFields.includes(searchLower)) {
        if (profile.e
        if 
 

          type: 'guest',
         
          badgeV
          data:
      }

      const matchFields
        guest.lastName,
        guest.phone,

      if (matchFiel
          p.email === guest.email || 
        )
        if (!existingProfi
          if (guest.email) metad
      }
     

            metadata,
          })
      }

      const guest = guests.find(g => g.
      

        reservation.guestId,
        reservation.status

        const metadata: string[] = []
        metadata.push(`Chec

        profile.lastName,
          title: `Rese
          badge: reser
            reservation.status 
            reservation.stat
          metadata,
        })

      if (matchFields.includes(searchLower)) {
        invoice.invoiceNumb
        invoice.guestEmail,
        invoice.status


        metadata.push(

          id: invoice.id
          title: `Invoice ${invoice.invoiceNumber}`,
          badge: invoice.status,
            invoice.status === 'final' ? 'default' :
            'outline',
          data: inv
      }

      }
  cons

    switch (result.type) {
        onNavigate('crm', {
      case 'reservation'
        guest.lastName,
        onNavigate('
        guest.phone,

    switch (type) {

        return <CalendarCheck size={18} classN
        return <Receipt size={18} className="text-succes
  }
  const groupedResults = useMemo(() => {
        )
      in
        if (!existingProfile) {
      groups[result.type].pus

  }, [searchResults])

      <Button
            id: guest.id,
            type: 'guest',
            title: `${guest.firstName} ${guest.lastName}`,
            subtitle: 'Guest',
            metadata,
            data: guest
          })
        }
      }
    })

    reservations.forEach((reservation) => {
      const guest = guests.find(g => g.id === reservation.guestId)
      const guestName = guest ? `${guest.firstName} ${guest.lastName}` : ''
      
      const matchFields = [
        reservation.confirmationNumber,
        guestName,
        reservation.guestId,
        reservation.roomId,
        reservation.status
      ].filter(Boolean).join(' ').toLowerCase()

      if (matchFields.includes(searchLower)) {
        const metadata = []
        metadata.push(`Check-in: ${format(reservation.checkInDate, 'MMM dd, yyyy')}`)
        metadata.push(`Check-out: ${format(reservation.checkOutDate, 'MMM dd, yyyy')}`)
        if (reservation.totalAmount) metadata.push(formatCurrency(reservation.totalAmount))

        results.push({
          id: reservation.id,
          type: 'reservation',
          title: `Reservation ${reservation.confirmationNumber}`,
          subtitle: guestName || 'No guest assigned',
          badge: reservation.status,
          badgeVariant: 
            reservation.status === 'confirmed' ? 'default' :
            reservation.status === 'checked-in' ? 'secondary' :
            reservation.status === 'checked-out' ? 'outline' :
            'destructive',
          metadata,
          data: reservation
        })
      }
    })

    invoices.forEach((invoice) => {
      const matchFields = [
        invoice.invoiceNumber,
        invoice.guestName,
        invoice.guestEmail,
        invoice.guestPhone,
        invoice.folioNumber,
        invoice.status
      ].filter(Boolean).join(' ').toLowerCase()

      if (matchFields.includes(searchLower)) {
        const metadata = []
        metadata.push(`Date: ${format(invoice.issueDate, 'MMM dd, yyyy')}`)
        metadata.push(`Total: ${formatCurrency(invoice.grandTotal)}`)
        if (invoice.amountDue > 0) metadata.push(`Due: ${formatCurrency(invoice.amountDue)}`)

        results.push({
          id: invoice.id,
          type: 'invoice',
          title: `Invoice ${invoice.invoiceNumber}`,
          subtitle: invoice.guestName,
          badge: invoice.status,
          badgeVariant: 
            invoice.status === 'final' ? 'default' :
            invoice.status === 'draft' ? 'secondary' :
            'outline',
          metadata,
          data: invoice
        })
      }
    })

    return results.slice(0, 50)
  }, [search, guests, guestProfiles, reservations, invoices])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setSearch('')

    switch (result.type) {
      case 'guest':
        onNavigate('crm', { selectedGuest: result.data })
        break
      case 'reservation':
        onNavigate('front-office', { selectedReservation: result.data })
        break
      case 'invoice':
        onNavigate('invoice-center', { selectedInvoice: result.data })
        break
    }
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'guest':
        return <User size={18} className="text-primary" />
      case 'reservation':
        return <CalendarCheck size={18} className="text-accent" />
      case 'invoice':
        return <Receipt size={18} className="text-success" />
    }
  }

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      guest: [],
      reservation: [],
      invoice: []
    }

    searchResults.forEach(result => {
      groups[result.type].push(result)
    })

    return groups
  }, [searchResults])

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full sm:w-64 justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlass size={16} className="mr-2" />
        <span className="hidden sm:inline">Search guests, reservations...</span>
                    )}
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
        </Comma

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type to search guests, reservations, or invoices..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center text-sm">
              <MagnifyingGlass size={48} className="mx-auto mb-2 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">
                {search.length < 2 
                  ? 'Type at least 2 characters to search'
                  : 'No results found'

              </p>

          </CommandEmpty>

          {groupedResults.guest.length > 0 && (
            <CommandGroup heading="Guests">
              {groupedResults.guest.map((result) => (

                  key={result.id}
                  value={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <div className="mt-0.5">
                    {getResultIcon(result.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.badge && (
                        <Badge variant={result.badgeVariant} className="text-xs">

                        </Badge>

                    </div>
                    <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    {result.metadata && result.metadata.length > 0 && (

                        {result.metadata.slice(0, 3).map((meta, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {meta}
                          </span>
                        ))}
                      </div>
                    )}

                </CommandItem>

            </CommandGroup>



            <CommandGroup heading="Reservations">
              {groupedResults.reservation.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}

                  className="flex items-start gap-3 p-3 cursor-pointer"

                  <div className="mt-0.5">

                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.badge && (
                        <Badge variant={result.badgeVariant} className="text-xs capitalize">
                          {result.badge.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    {result.metadata && result.metadata.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.metadata.slice(0, 3).map((meta, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">

                          </span>

                      </div>

                  </div>
                </CommandItem>
              ))}

          )}

          {groupedResults.invoice.length > 0 && (
            <CommandGroup heading="Invoices">
              {groupedResults.invoice.map((result) => (
                <CommandItem
                  key={result.id}

                  onSelect={() => handleSelect(result)}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >

                    {getResultIcon(result.type)}

                  <div className="flex-1 min-w-0">

                      <p className="font-medium truncate">{result.title}</p>

                        <Badge variant={result.badgeVariant} className="text-xs capitalize">

                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    {result.metadata && result.metadata.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.metadata.slice(0, 3).map((meta, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {meta}

                        ))}

                    )}

                </CommandItem>

            </CommandGroup>

        </CommandList>

    </>

}
