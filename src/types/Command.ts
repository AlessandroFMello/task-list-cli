export type Command = 
  | 'add'
  | 'update'
  | 'delete'
  | 'mark-in-progress'
  | 'mark-done'
  | 'list'
  | 'list-files'
  | 'current-file'
  | 'clear'
  | 'set-file-date';