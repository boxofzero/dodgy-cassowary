export interface AccordionState {
  index_position: number
  open: boolean
}

export interface Accordion {
  [group_key: string]: {
    [index_key: string]: AccordionState
  }
}

export const accordion: Accordion = {}