export type Command = 
  | 'add'
  | 'update'
  | 'delete'
  | 'mark-in-progress'
  | 'mark-done'
  | 'list'
  | 'ls'
  | 'list-files'
  | 'current-file'
  | 'clear'
  | 'set-file-date';