import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'GARUD · AIIMS Jammu Nursing Workforce Pilot',description:'Five-ward live QR pilot and interactive nursing workforce walkthrough.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
