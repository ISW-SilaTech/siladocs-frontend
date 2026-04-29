declare module 'react-data-table-component-extensions' {
  import { ComponentType } from 'react';
  import { DataTableProps } from 'react-data-table-component';

  export interface DataTableExtensionsProps {
    columns: any[];
    data: any[];
    print?: boolean;
    export?: boolean;
    exportHeaders?: boolean;
    fileName?: string;
    [key: string]: any;
  }

  const DataTableExtensions: ComponentType<DataTableExtensionsProps>;
  export default DataTableExtensions;
}
