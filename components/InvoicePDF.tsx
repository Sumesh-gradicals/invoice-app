import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed (using standard fonts for now)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 40,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  header: {
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'heavy', // Helvetica doesn't support 'heavy' usually, 'bold' is standard
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    color: '#000000', 
    textTransform: 'uppercase',
  },
  // We can simulate a gradient text effect roughly by color/position if complex, 
  // but for PDF basic "GRADICAL" text is safer to ensure rendering.
  // True gradient text is hard in react-pdf without SVG. 
  // We'll stick to bold black as per "branding" request implies the name change mostly.

  headline: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  section: {
    marginBottom: 20,
    border: '1px solid #E2E8F0', // slate-200
    borderRadius: 4,
    padding: 15,
  },
  
  label: {
    fontSize: 10,
    color: '#64748B', // slate-500
    marginBottom: 5,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  
  value: {
    fontSize: 12,
    color: '#000000',
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
    marginBottom: 10,
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingBottom: 5,
    marginBottom: 5,
  },
  
  colItem: { width: '50%' },
  colQty: { width: '15%', textAlign: 'right' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },

  bold: { fontFamily: 'Helvetica-Bold' },
  
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    fontSize: 10,
    color: '#64748B',
  },

  brandFooter: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  }
});

interface InvoicePDFProps {
  customer: any;
  items: any[];
  subtotal: number;
  total: number;
  invoiceId: string;
  date: string;
}

export const InvoicePDF = ({ customer, items, subtotal, total, invoiceId, date }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header with GRADICAL branding */}
      <View style={styles.header}>
        <Text style={styles.logoText}>GRADICAL</Text>
      </View>

      <Text style={styles.headline}>
        Test sent you an invoice for ${total.toFixed(2)}
      </Text>

      {/* Customer Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Customer</Text>
        {customer ? (
            <View>
                <Text style={[styles.value, styles.bold]}>{customer.name}</Text>
                <Text style={styles.value}>{customer.email}</Text>
                {customer.phone && <Text style={styles.value}>{customer.phone}</Text>}
            </View>
        ) : (
            <Text style={styles.value}>Waiting for customer selection...</Text>
        )}
      </View>

      {/* Invoice Details Section */}
      <View style={styles.section}>
        <Text style={[styles.value, styles.bold, { marginBottom: 10 }]}>Invoice #{invoiceId}</Text>
        <Text style={[styles.value, {color: '#64748B', marginBottom: 20}]}>{date}</Text>
        
        {/* Table Header */}
        <View style={styles.tableHeader}>
             <Text style={[styles.label, styles.colItem]}>ITEM</Text>
             <Text style={[styles.label, styles.colQty]}>QTY</Text>
             <Text style={[styles.label, styles.colPrice]}>PRICE</Text>
             <Text style={[styles.label, styles.colTotal]}>TOTAL</Text>
        </View>

        {/* Line Items */}
        {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
                <Text style={[styles.value, styles.colItem]}>{item.name}</Text>
                <Text style={[styles.value, styles.colQty]}>{item.qty}</Text>
                <Text style={[styles.value, styles.colPrice]}>${Number(item.price).toFixed(2)}</Text>
                <Text style={[styles.value, styles.colTotal]}>${(item.qty * item.price).toFixed(2)}</Text>
            </View>
        ))}

        {/* Summary */}
        <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }}>
            <View style={styles.row}>
                <Text style={styles.value}>Subtotal</Text>
                <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.value, styles.bold, { fontSize: 14 }]}>Total</Text>
                <Text style={[styles.value, styles.bold, { fontSize: 14 }]}>${total.toFixed(2)}</Text>
            </View>
        </View>

      </View>

      {/* Footer */}
      <View style={styles.footer}>
         <Text>Test</Text>
         <Text style={{ marginTop: 10 }}>© 2026 Block, Inc.</Text>
         <Text>All rights reserved.</Text>
         
         <View style={styles.brandFooter}>
            <View style={{ width: 15, height: 15, backgroundColor: 'black', borderRadius: 3 }} />
            <Text style={{ fontFamily: 'Helvetica-Bold', color: 'black' }}>GRADICAL</Text>
         </View>
      </View>

    </Page>
  </Document>
);
