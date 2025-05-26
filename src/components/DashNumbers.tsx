import { Switch } from "./ui-me/Switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

export const DashNumbers = () => {
  return (
    <div className='max-w-7xl mx-auto px-4'>
        <section className='bg-in-gray-ligth py-2 px-4 rounded-xl'>
            <Table>
                <TableCaption>Usuario conectados</TableCaption>
                <TableHeader>
                    <TableRow className="hover:bg-in-gray-ligth">
                        <TableHead className="text-in-beige">Usuario</TableHead>
                        <TableHead className="text-in-beige">Numero</TableHead>
                        <TableHead className="text-in-beige">Accion</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="hover:bg-in-gray-ligth">
                        <TableCell className="text-in-beige">Usuario 1</TableCell>
                        <TableCell className="text-in-beige">1234567890</TableCell>
                        <TableCell>
                            <Switch />
                        </TableCell>   
                    
                    </TableRow> 
                </TableBody>
            </Table>
        </section>
    </div>
  )
}
