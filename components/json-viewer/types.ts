export interface JsonViewerProps {
  /**
   * The data to be displayed in the JSON viewer
   */
  data: any
  /**
   * The name of the root node
   * @default "root"
   */
  rootName?: string
  /**
   * Whether the JSON tree should be expanded by default
   * @default true
   */
  expanded?: boolean
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string
  /**
   * Maximum initial depth to expand
   * @default 1
   */
  initialExpandLevel?: number
  /**
   * Whether to show the copy button
   * @default true
   */
  showCopyButton?: boolean
}

export interface JsonNodeProps {
  data: any
  name: string
  level: number
  defaultExpanded: boolean
  initialExpandLevel: number
}

