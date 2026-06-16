import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  entrySubtitle: {
    fontSize: 10,
    color: '#666',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.5,
  }
});

export const ResumePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName || 'Your Name'}</Text>
        <Text style={styles.contact}>
          {data.personalInfo.email} {data.personalInfo.phone ? `| ${data.personalInfo.phone}` : ''} {data.personalInfo.location ? `| ${data.personalInfo.location}` : ''}
        </Text>
      </View>

      {data.personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.text}>{data.personalInfo.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map(exp => (
            <View key={exp.id} style={{ marginBottom: 10 }}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.position}</Text>
                <Text style={styles.entrySubtitle}>{exp.company}</Text>
              </View>
              <Text style={styles.text}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map(edu => (
            <View key={edu.id} style={{ marginBottom: 10 }}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.institution}</Text>
                <Text style={styles.entrySubtitle}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skills}>{data.skills.map(s => s.name).join(', ')}</Text>
        </View>
      )}
    </Page>
  </Document>
);
