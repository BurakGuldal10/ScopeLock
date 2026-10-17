import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { SignoffDetails } from '@/app/actions/client-signoff';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 14,
    marginBottom: 18,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  logoSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    textAlign: 'right',
  },
  docTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tokenText: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
  },
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridCol: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subValue: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1,
  },
  scopeBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 14,
  },
  requestTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 6,
  },
  scopeDesc: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#334155',
  },
  feeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginBottom: 14,
  },
  feeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3730a3',
  },
  feeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#312e81',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signBox: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  auditBox: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    backgroundColor: '#f0fdf4',
  },
  signatureImage: {
    height: 50,
    marginVertical: 4,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    lineHeight: 1.4,
  },
});

interface SignoffDocumentProps {
  signoff: SignoffDetails;
}

export function SignoffDocument({ signoff }: SignoffDocumentProps) {
  const isApproved = signoff.status === 'onaylandi';
  const hasFee = Number(signoff.additional_fee) > 0;
  const isSvgSignature = signoff.signature_data?.startsWith('data:image/svg+xml');

  return (
    <Document title={`ScopeLock-Onay-${signoff.token.substring(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>SCOPELOCK</Text>
            <Text style={styles.logoSub}>Dijital Kapsam & Mutabakat Sistemi</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>KAPSAM ONAY BELGESİ</Text>
            <Text style={styles.tokenText}>Belge Ref: {signoff.token}</Text>
            {isApproved && (
              <Text style={styles.statusBadge}>RESMEN ONAYLANDI</Text>
            )}
          </View>
        </View>

        {/* 2-Column Parties Info */}
        <View style={styles.grid2}>
          <View style={styles.gridCol}>
            <Text style={styles.label}>HİZMET VEREN AJANS</Text>
            <Text style={styles.value}>{signoff.agency?.name || 'Ajans'}</Text>
            <Text style={styles.subValue}>{signoff.agency?.email}</Text>
          </View>

          <View style={styles.gridCol}>
            <Text style={styles.label}>MÜŞTERİ / PROJE</Text>
            <Text style={styles.value}>{signoff.project?.client_name}</Text>
            <Text style={styles.subValue}>{signoff.project?.client_email}</Text>
            <Text style={styles.subValue}>Proje: {signoff.project?.name}</Text>
          </View>
        </View>

        {/* Scope and Details */}
        <View style={styles.scopeBox}>
          <Text style={styles.label}>TALEP BAŞLIĞI VE KAPSAM</Text>
          <Text style={styles.requestTitle}>{signoff.title}</Text>
          <Text style={styles.scopeDesc}>{signoff.description}</Text>
        </View>

        {/* Additional Fee */}
        <View style={styles.feeBox}>
          <Text style={styles.feeLabel}>Kapsam Onay Tutarı / Ek Ücret:</Text>
          <Text style={styles.feeValue}>
            {hasFee ? `$ ${signoff.additional_fee} USD` : 'Ek Ücret Yok ($ 0.00)'}
          </Text>
        </View>

        {/* Signature & Audit Info */}
        <View style={styles.signatureSection}>
          <View style={styles.signBox}>
            <Text style={styles.label}>MÜŞTERİ İMZASI / ONAY MÜHRÜ</Text>
            {signoff.signature_data && !isSvgSignature ? (
              <Image src={signoff.signature_data} style={styles.signatureImage} />
            ) : (
              <View style={{ marginVertical: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#15803d' }}>
                  ✓ DİJİTAL MÜHÜRLE ONAYLANDI
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 8, color: '#334155', fontWeight: 'bold' }}>
              İmzalayan: {signoff.project?.client_name}
            </Text>
          </View>

          <View style={styles.auditBox}>
            <Text style={styles.label}>GÜVENLİK VE ZAMAN DAMGASI</Text>
            <Text style={{ fontSize: 8, color: '#166534', marginTop: 3 }}>
              Zaman: {signoff.signed_at || new Date().toISOString()}
            </Text>
            <Text style={{ fontSize: 8, color: '#166534', marginTop: 2 }}>
              İstemci IP: {signoff.signer_ip || 'Kayıtlı'}
            </Text>
            <Text style={{ fontSize: 8, color: '#166534', marginTop: 2 }}>
              Doğrulama: 5070 Sayılı Kanun Uyumlu Kayıt
            </Text>
            <Text style={{ fontSize: 7, color: '#4ade80', marginTop: 6 }}>
              SHA-256 Kriptografik Mutabakat Mührü
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bu onay belgesi ScopeLock sistemi üzerinden oluşturulmuş olup, tarafların mutabakatını tevsik eder.
            Zaman damgası ve IP adresi ile mühürlenmiştir. Web doğrulaması: signoffy.com/view/{signoff.token}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
