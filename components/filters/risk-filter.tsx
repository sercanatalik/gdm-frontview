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
  Calendar,
  CalendarPlus,
  CalendarIcon as CalendarSync,
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
} from "lucide-react"
import { nanoid } from "nanoid"
import * as React from "react"
import { AnimateChangeInHeight } from "@/components/ui/filters"
import Filters, { type Filter, type FilterOption, type FilterConfig } from "@/components/ui/filters"

// Define constants that were previously enums
export const FilterTypes = {
  SL1: "SL1",
  DESK: "desk",
  PORTFOLIO: "portfolio",
  REGION: "region",
 
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

// Create icon mapping
const iconMapping: Record<string, React.ReactNode> = {
  [FilterTypes.SL1]: <CircleDashed className="size-3.5" />,
  [FilterTypes.DESK]: <UserCircle className="size-3.5" />,
  [FilterTypes.PORTFOLIO]: <Tag className="size-3.5" />,
  [FilterTypes.REGION]: <SignalHigh className="size-3.5" />,
  // [FilterTypes.MATURITY_DATE]: <Calendar className="size-3.5" />,
  // [FilterTypes.TRADE_DATE]: <CalendarPlus className="size-3.5" />,
  // [FilterTypes.DTM]: <CalendarSync className="size-3.5" />,
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


const filterOptionsGetter = async (tableName: string, columnName: string): Promise<FilterOption[]> => {
  try {
    // Fetch distinct values from the specified table and column
    const response = await fetch(`/api/tables/distinct?table=${tableName}&column=${columnName}`);
    const values = await response.json();
    console.log(values)
    // Map the values to FilterOption format
    return values.map((value: string) => ({
      name: value,
      icon: iconMapping[value] || undefined, // Use existing icon mapping if available
    }));
  } catch (error) {
    console.error(`Error fetching filter options for ${tableName}.${columnName}:`, error);
    return [];
  }
}

interface RiskFilterProps {
  filters: Filter[]
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>
  tableName: string
}

export function RiskFilter({ filters, setFilters, tableName }: RiskFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedView, setSelectedView] = React.useState<string | null>(null)
  const [commandInput, setCommandInput] = React.useState("")
  const commandInputRef = React.useRef<HTMLInputElement>(null)
  
  const [sl1FilterOptions, setSl1FilterOptions] = React.useState<FilterOption[]>([])

  React.useEffect(() => {
    const loadSl1Options = async () => {
      const _sl1FilterOptions = await filterOptionsGetter(tableName, "SL1")
      const options = _sl1FilterOptions.map((option) => ({
        name: option.name,
        icon: iconMapping[option.name],
      }))
      setSl1FilterOptions(options)
    }
    loadSl1Options()
  }, [tableName])

  const filterViewToFilterOptions: Record<string, FilterOption[]> = {
    [FilterTypes.SL1]: sl1FilterOptions,
    [FilterTypes.DESK]: Object.values(DeskValues).map((desk) => ({
      name: desk,
      icon: iconMapping[desk],
    })),
    [FilterTypes.PORTFOLIO]: Object.values(PortfolioValues).map((portfolio) => ({
      name: portfolio,
      icon: iconMapping[portfolio],
    })),
    [FilterTypes.REGION]: Object.values(RegionValues).map((region) => ({
      name: region,
      icon: iconMapping[region],
    })),
  }

  return (
    <div className="flex gap-5 flex-wrap items-center">
      <Filters
        filters={filters}
        setFilters={setFilters}
        config={{
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
                name: FilterTypes.REGION,
                icon: iconMapping[FilterTypes.REGION],
              },
            ],
            [
              {
                name: FilterTypes.MATURITY_DATE,
                icon: iconMapping[FilterTypes.MATURITY_DATE],
              },
              {
                name: FilterTypes.TRADE_DATE,
                icon: iconMapping[FilterTypes.TRADE_DATE],
              },
              {
                name: FilterTypes.DTM,
                icon: iconMapping[FilterTypes.DTM],
              },
            ],
          ],
          filterViewToFilterOptions,
        }}
        iconMapping={iconMapping}
        dateValues={Object.values(DateValues)}
        operatorConfig={{
          [FilterTypes.SL1]: {
            single: [FilterOperators.IS, FilterOperators.IS_NOT],
            multiple: [FilterOperators.IS_ANY_OF, FilterOperators.IS_NOT],
          },
          [FilterTypes.DESK]: {
            single: [FilterOperators.IS, FilterOperators.IS_NOT],
            multiple: [FilterOperators.IS_ANY_OF, FilterOperators.IS_NOT],
          },
          [FilterTypes.REGION]: {
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
          [FilterTypes.MATURITY_DATE]: {
            past: [FilterOperators.IS, FilterOperators.IS_NOT],
            date: [FilterOperators.BEFORE, FilterOperators.AFTER],
          },
          [FilterTypes.TRADE_DATE]: {
            past: [FilterOperators.IS, FilterOperators.IS_NOT],
            date: [FilterOperators.BEFORE, FilterOperators.AFTER],
          },
          [FilterTypes.DTM]: {
            past: [FilterOperators.IS, FilterOperators.IS_NOT],
            date: [FilterOperators.BEFORE, FilterOperators.AFTER],
          },
        }}
      />
      {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="transition group h-8 text-sm items-center rounded-sm"
          onClick={() => setFilters([])}
        >
          Clear
        </Button>
      )}
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
                    {filterViewToFilterOptions[selectedView].map((filter: FilterOption) => (
                      <CommandItem
                        className="group text-muted-foreground flex gap-2 items-center"
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue) => {
                          setFilters((prev: Filter[]) => [
                            ...prev,
                            {
                              id: nanoid(),
                              type: selectedView,
                              operator:
                                selectedView === FilterTypes.MATURITY_DATE && currentValue !== DateValues.IN_THE_PAST
                                  ? FilterOperators.BEFORE
                                  : FilterOperators.IS,
                              value: [currentValue],
                            },
                          ])
                          setTimeout(() => {
                            setSelectedView(null)
                            setCommandInput("")
                          }, 200)
                          setOpen(false)
                        }}
                      >
                        {filter.icon}
                        <span className="text-accent-foreground">{filter.name}</span>
                        {filter.label && <span className="text-muted-foreground text-xs ml-auto">{filter.label}</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  [
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
                        name: FilterTypes.REGION,
                        icon: iconMapping[FilterTypes.REGION],
                      },
                    ],
                    [
                      {
                        name: FilterTypes.MATURITY_DATE,
                        icon: iconMapping[FilterTypes.MATURITY_DATE],
                      },
                      {
                        name: FilterTypes.TRADE_DATE,
                        icon: iconMapping[FilterTypes.TRADE_DATE],
                      },
                      {
                        name: FilterTypes.DTM,
                        icon: iconMapping[FilterTypes.DTM],
                      },
                    ],
                  ].map((group: FilterOption[], groupIndex) => {
                    const groupKey = `group-${groupIndex}-${nanoid()}`
                    return (
                      <CommandGroup key={groupKey} className="flex flex-col gap-2">
                        {group.map((filter: FilterOption) => (
                          <CommandItem
                            className="group text-muted-foreground flex gap-2 items-center"
                            key={`${filter.name}-${nanoid()}`}
                            value={filter.name}
                            onSelect={(currentValue) => {
                              setSelectedView(currentValue as string)
                              setCommandInput("")
                              commandInputRef.current?.focus()
                            }}
                          >
                            {filter.icon}
                            <span className="text-accent-foreground">{filter.name}</span>
                          </CommandItem>
                        ))}
                        {groupIndex < [
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
                              name: FilterTypes.REGION,
                              icon: iconMapping[FilterTypes.REGION],
                            },
                          ],
                          [
                            {
                              name: FilterTypes.MATURITY_DATE,
                              icon: iconMapping[FilterTypes.MATURITY_DATE],
                            },
                            {
                              name: FilterTypes.TRADE_DATE,
                              icon: iconMapping[FilterTypes.TRADE_DATE],
                            },
                            {
                              name: FilterTypes.DTM,
                              icon: iconMapping[FilterTypes.DTM],
                            },
                          ],
                        ].length - 1 && <CommandSeparator />}
                      </CommandGroup>
                    )
                  })
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
    </div>
  )
}

