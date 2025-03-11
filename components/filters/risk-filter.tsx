// Refactor the file to separate concerns and improve organization

"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDotDashed,
  CircleEllipsis,
  ListFilter,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Tag,
  UserCircle,
  Calendar,
  Trash2,
  Briefcase,
} from "lucide-react"
import { nanoid } from "nanoid"
import * as React from "react"
import { AnimateChangeInHeight } from "@/components/ui/filters"
import Filters, { type Filter, type FilterOption, type FilterConfig } from "@/components/ui/filters"

// Constants
export const FilterTypes = {
  SL1: "SL1",
  DESK: "desk",
  PORTFOLIO: "portfolio",
  ASOFDATE: "asOfDate",
}

export const FilterOperators = {
  IS: "is",
  IS_NOT: "is not",
  IS_ANY_OF: "is any of",
  INCLUDE: "include",
  DO_NOT_INCLUDE: "do not include",
  INCLUDE_ALL_OF: "include all of",
  INCLUDE_ANY_OF: "include any of",
  EXCLUDE_ALL_OF: "exclude all of",
  EXCLUDE_IF_ANY_OF: "exclude if any of",
  BEFORE: "before",
  AFTER: "after",
}

export const SL1Values = {
  ABS_CLO: "ABS&CLO",
  EM: "EM",
  LOAN: "Loan",
  PRIVATE_CREDIT: "Private Credit",
  OTHER: "Other",
}

export const DeskValues = {
  CASH_FINANCING_SOL: "Cash Financing Sol",
  STRUCTURED_COMMODITY_PRODUCTS: "Structured Commodity Products",
  STRUCTURED_EQUITY_PRODUCTS: "Structured Equity Products",
  STRUCTURED_INDEX_PRODUCTS: "Structured Index Products",
}

export const PortfolioValues = {
  LEVERAGE: "Leverage",
  EQUITY: "Equity",
  FIXED_INCOME: "Fixed Income",
  OTHER: "Other",
}

export const RegionValues = {
  EMEA: "EMEA",
  APAC: "APAC",
  AMERICAS: "Americas",
  OTHER: "Other",
}

export const DateValues = {
  IN_THE_PAST: "in the past",
  IN_24_HOURS: "24 hours from now",
  IN_3_DAYS: "3 days from now",
  IN_1_WEEK: "1 week from now",
  IN_1_MONTH: "1 month from now",
  IN_3_MONTHS: "3 months from now",
}

// Icon mapping
const iconMapping: Record<string, React.ReactNode> = {
  [FilterTypes.SL1]: <CircleDashed className="size-3.5" />,
  [FilterTypes.DESK]: <Briefcase className="size-3.5" />,
  [FilterTypes.PORTFOLIO]: <Tag className="size-3.5" />,
  [FilterTypes.ASOFDATE]: <Calendar className="size-3.5" />,
  [SL1Values.ABS_CLO]: <CircleDashed className="size-3.5 text-muted-foreground" />,
  [SL1Values.EM]: <Circle className="size-3.5 text-primary" />,
  [SL1Values.LOAN]: <CircleDotDashed className="size-3.5 text-yellow-400" />,
  [SL1Values.PRIVATE_CREDIT]: <CircleEllipsis className="size-3.5 text-green-400" />,
  [SL1Values.OTHER]: <CircleCheck className="size-3.5 text-blue-400" />,
  [RegionValues.EMEA]: <CircleAlert className="size-3.5" />,
  [RegionValues.APAC]: <SignalHigh className="size-3.5" />,
  [RegionValues.AMERICAS]: <SignalMedium className="size-3.5" />,
  [RegionValues.OTHER]: <SignalLow className="size-3.5" />,
  [PortfolioValues.LEVERAGE]: <div className="bg-red-400 rounded-full size-2.5" />,
  [PortfolioValues.EQUITY]: <div className="bg-blue-400 rounded-full size-2.5" />,
  [PortfolioValues.FIXED_INCOME]: <div className="bg-amber-400 rounded-full size-2.5" />,
  [PortfolioValues.OTHER]: <div className="bg-green-400 rounded-full size-2.5" />,
}

// Helper functions
const fetchFilterOptions = async (tableName: string, columnName: string): Promise<FilterOption[]> => {
  try {
    const response = await fetch(`/api/tables/distinct?table=${tableName}&column=${columnName}`)
    const values = await response.json()
    return values.map((value: string) => ({
      name: value,
      icon: iconMapping[value] || undefined,
    }))
  } catch (error) {
    console.error(`Error fetching filter options for ${tableName}.${columnName}:`, error)
    return []
  }
}

// Types
interface RiskFilterProps {
  filters: Filter[]
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>
  tableName?: string
}

// Main component
export function RiskFilter({ filters, setFilters, tableName = "risk_f_mv" }: RiskFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedView, setSelectedView] = React.useState<string | null>(null)
  const [commandInput, setCommandInput] = React.useState("")
  const commandInputRef = React.useRef<HTMLInputElement>(null)

  const [filterOptions, setFilterOptions] = React.useState<{
    [key: string]: FilterOption[]
  }>({
    [FilterTypes.SL1]: [],
    [FilterTypes.DESK]: [],
    [FilterTypes.PORTFOLIO]: [],
    [FilterTypes.ASOFDATE]: [],
  })

  // Load filter options
  React.useEffect(() => {
    const loadFilterOptions = async () => {
      const options = {
        [FilterTypes.SL1]: await fetchFilterOptions(tableName, "SL1"),
        [FilterTypes.DESK]: await fetchFilterOptions(tableName, "desk"),
        [FilterTypes.PORTFOLIO]: await fetchFilterOptions(tableName, "portfolio"),
        [FilterTypes.ASOFDATE]: await fetchFilterOptions(tableName, "asOfDate"),
      }

      // Map icons to options
      Object.keys(options).forEach((key) => {
        options[key] = options[key].map((option) => ({
          name: option.name,
          icon: iconMapping[option.name],
        }))
      })

      setFilterOptions(options)
    }

    loadFilterOptions()
  }, [tableName])

  // Filter configuration
  const filterConfig: FilterConfig = {
    filterTypes: FilterTypes,
    filterOperators: FilterOperators,
    filterViewOptions: [
      [
        {
          name: FilterTypes.SL1,
          icon: iconMapping[FilterTypes.SL1],
        },
        {
          name: FilterTypes.DESK,
          icon: iconMapping[FilterTypes.DESK],
        },
        {
          name: FilterTypes.PORTFOLIO,
          icon: iconMapping[FilterTypes.PORTFOLIO],
        },
        {
          name: FilterTypes.ASOFDATE,
          icon: iconMapping[FilterTypes.ASOFDATE],
        },
      ],
      [],
    ],
    filterViewToFilterOptions: filterOptions,
  }

  // Operator configuration
  const operatorConfig = {
    [FilterTypes.SL1]: {
      single: [FilterOperators.IS, FilterOperators.IS_NOT],
      multiple: [FilterOperators.IS_ANY_OF, FilterOperators.IS_NOT],
    },
    [FilterTypes.DESK]: {
      single: [FilterOperators.IS, FilterOperators.IS_NOT],
      multiple: [FilterOperators.IS_ANY_OF, FilterOperators.IS_NOT],
    },
    [FilterTypes.PORTFOLIO]: {
      single: [FilterOperators.INCLUDE, FilterOperators.DO_NOT_INCLUDE],
      multiple: [
        FilterOperators.INCLUDE_ANY_OF,
        FilterOperators.INCLUDE_ALL_OF,
        FilterOperators.EXCLUDE_ALL_OF,
        FilterOperators.EXCLUDE_IF_ANY_OF,
      ],

    },
    [FilterTypes.ASOFDATE]: {
      single: [FilterOperators.INCLUDE, FilterOperators.DO_NOT_INCLUDE],
      multiple: [
        FilterOperators.INCLUDE_ANY_OF,
        FilterOperators.INCLUDE_ALL_OF,
        FilterOperators.EXCLUDE_ALL_OF,
        FilterOperators.EXCLUDE_IF_ANY_OF,
      ],
      
    },
  }

  // Handle adding a new filter
  const handleAddFilter = (filterType: string, filterValue: string) => {
    setFilters((prev: Filter[]) => [
      ...prev,
      {
        id: nanoid(),
        type: filterType,
        operator: FilterOperators.IS,
        value: [filterValue],
      },
    ])
    setTimeout(() => {
      setSelectedView(null)
      setCommandInput("")
    }, 200)
    setOpen(false)
  }

  return (
    <div className="flex gap-5 flex-wrap items-center z-50" >
      <Filters
        filters={filters}
        setFilters={setFilters}
        config={filterConfig}
        iconMapping={iconMapping}
        dateValues={Object.values(DateValues)}
        operatorConfig={operatorConfig}
      />

      {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="transition h-6 border-none text-xs text-muted-foreground hover:bg-transparent hover:text-red-500"
          onClick={() => setFilters([])}
        >
          <Trash2 className="size-3 mr-0" />
          Reset
        </Button>
      )}

      <FilterPopover
        open={open}
        setOpen={setOpen}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        commandInputRef={commandInputRef}
        filterOptions={filterOptions}
        filters={filters}
        onAddFilter={handleAddFilter}
      />
    </div>
  )
}

// Filter popover component
interface FilterPopoverProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedView: string | null
  setSelectedView: (view: string | null) => void
  commandInput: string
  setCommandInput: (input: string) => void
  commandInputRef: React.RefObject<HTMLInputElement>
  filterOptions: Record<string, FilterOption[]>
  filters: Filter[]
  onAddFilter: (filterType: string, filterValue: string) => void
}

function FilterPopover({
  open,
  setOpen,
  selectedView,
  setSelectedView,
  commandInput,
  setCommandInput,
  commandInputRef,
  filterOptions,
  filters,
  onAddFilter,
}: FilterPopoverProps) {
  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) {
          setTimeout(() => {
            setSelectedView(null)
            setCommandInput("")
          }, 200)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className={cn(
            "transition group h-8 text-sm items-center rounded-sm flex gap-1.5 items-center",
            filters.length > 0 && "w-8",
          )}
        >
          <ListFilter className="size-4 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
          {!filters.length && "Filter"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={selectedView ? selectedView : "Filter..."}
              className="h-9"
              value={commandInput}
              onInputCapture={(e) => {
                setCommandInput(e.currentTarget.value)
              }}
              ref={commandInputRef}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {selectedView ? (
                <CommandGroup className="flex flex-col gap-2" key={selectedView}>
                  {filterOptions[selectedView]?.map((filter: FilterOption) => (
                    <CommandItem
                      className="group text-muted-foreground flex gap-2 items-center"
                      key={filter.name}
                      value={filter.name}
                      onSelect={(currentValue) => onAddFilter(selectedView, currentValue)}
                    >
                      {filter.icon}
                      <span className="text-accent-foreground">{filter.name}</span>
                      {filter.label && <span className="text-muted-foreground text-xs ml-auto">{filter.label}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <FilterTypeGroups setSelectedView={setSelectedView} commandInputRef={commandInputRef} />
              )}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  )
}

// Filter type groups component
interface FilterTypeGroupsProps {
  setSelectedView: (view: string) => void
  commandInputRef: React.RefObject<HTMLInputElement>
}

function FilterTypeGroups({ setSelectedView, commandInputRef }: FilterTypeGroupsProps) {
  const filterGroups = [
    [
      {
        name: FilterTypes.SL1,
        icon: iconMapping[FilterTypes.SL1],
      },
      {
        name: FilterTypes.DESK,
        icon: iconMapping[FilterTypes.DESK],
      },
      {
        name: FilterTypes.PORTFOLIO,
        icon: iconMapping[FilterTypes.PORTFOLIO],
      },
      {
        name: FilterTypes.ASOFDATE,
        icon: iconMapping[FilterTypes.ASOFDATE],
      },
    ],
  ]

  return (
    <>
      {filterGroups.map((group: FilterOption[], groupIndex) => (
        <CommandGroup key={`group-${groupIndex}-${nanoid()}`} className="flex flex-col gap-2">
          {group.map((filter: FilterOption) => (
            <CommandItem
              className="group text-muted-foreground flex gap-2 items-center"
              key={`${filter.name}-${nanoid()}`}
              value={filter.name}
              onSelect={(currentValue) => {
                setSelectedView(currentValue as string)
                commandInputRef.current?.focus()
              }}
            >
              {filter.icon}
              <span className="text-accent-foreground">{filter.name}</span>
            </CommandItem>
          ))}
          {groupIndex < filterGroups.length - 1 && <CommandSeparator />}
        </CommandGroup>
      ))}
    </>
  )
}

