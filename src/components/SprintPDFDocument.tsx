import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Sprint } from '../types/sprint';
import { formatDuration } from '../utils/formatters';

// Register fonts
// Note: You would need to host these font files in your public directory
// Font.register({
//   family: 'Oswald',
//   src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica',
    color: 'grey',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
  },
  text: {
    fontSize: 11,
    marginBottom: 3,
  },
  sprintContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingTop: 20,
  },
  sprintContent: {
    fontSize: 10,
    fontFamily: 'Courier',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FAFAFA'
  },
  stat: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  statLabel: {
    fontSize: 10,
    color: 'grey',
    marginTop: 3,
  },
  pageBreak: {
    break: 'before',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
    fontSize: 9,
  }
});

interface SprintPDFDocumentProps {
  sprints: Sprint[];
}

const SprintPDFDocument: React.FC<SprintPDFDocumentProps> = ({ sprints }) => {
  if (!sprints || sprints.length === 0) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No sprints selected for export.</Text>
        </Page>
      </Document>
    );
  }

  // --- Aggregate Calculations ---
  const sortedSprints = [...sprints].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  const firstSprintDate = new Date(sortedSprints[0].completedAt).toLocaleDateString();
  const lastSprintDate = new Date(sortedSprints[sortedSprints.length - 1].completedAt).toLocaleDateString();
  const totalWordCount = sortedSprints.reduce((sum, s) => sum + s.wordCount, 0);
  const totalDurationSeconds = sortedSprints.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0);
  const totalDurationFormatted = formatDuration(totalDurationSeconds);
  const averageWpm = totalDurationSeconds > 0 ? Math.round((totalWordCount / totalDurationSeconds) * 60) : 0;
  const allTags = Array.from(new Set(sortedSprints.flatMap(s => s.tags || []))).join(', ');

  return (
    <Document>
      {/* --- Summary Page --- */}
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>QuickPen Sprint Export Report</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Summary</Text>
          <Text style={styles.text}>Number of Sprints: {sortedSprints.length}</Text>
          <Text style={styles.text}>Date Range: {firstSprintDate} - {lastSprintDate}</Text>
          <Text style={styles.text}>All Unique Tags: {allTags || 'None'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalWordCount}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{averageWpm}</Text>
            <Text style={styles.statLabel}>Average WPM</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalDurationFormatted}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included Sprints</Text>
            {sortedSprints.map((sprint, index) => (
                <Text key={sprint.id || index} style={styles.text}>
                    - Sprint from {new Date(sprint.completedAt).toLocaleString()} ({sprint.wordCount} words)
                </Text>
            ))}
        </View>
        <Text style={styles.footer} fixed>
          Generated by QuickPen
        </Text>
      </Page>

      {/* --- Individual Sprint Pages --- */}
      {sortedSprints.map((sprint, index) => {
        const duration = sprint.actualDuration ?? sprint.duration;
        const wpm = duration > 0 ? Math.round((sprint.wordCount / duration) * 60) : 0;
        
        return (
          <Page key={sprint.id || index} size="A4" style={styles.page}>
            <View style={styles.sectionTitle}>
              <Text>Sprint from {new Date(sprint.completedAt).toLocaleString()}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                  <Text style={styles.statValue}>{wpm}</Text>
                  <Text style={styles.statLabel}>WPM</Text>
              </View>
              <View style={styles.stat}>
                  <Text style={styles.statValue}>{sprint.wordCount}</Text>
                  <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.stat}>
                  <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.text}>Tags: {sprint.tags?.join(', ') || 'None'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sprintContent}>{sprint.content}</Text>
            </View>

             <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `${pageNumber} / ${totalPages}`
              )} fixed />
          </Page>
        )
      })}
    </Document>
  );
}

export default SprintPDFDocument;