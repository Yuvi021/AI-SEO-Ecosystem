export class LearningAgent {
  constructor() {
    this.name = 'LearningAgent';
    this.status = 'ready';
    this.learnedPatterns = {
      commonKeywords: new Map(),
      metaPatterns: [],
      contentPatterns: [],
      schemaTypes: new Map()
    };
  }

  async learn(results) {
    try {
      this.status = 'learning';
      
      // Learn from keyword analysis
      if (results.keyword?.primaryKeywords) {
        results.keyword.primaryKeywords.forEach(({ word, count }) => {
          const current = this.learnedPatterns.commonKeywords.get(word) || 0;
          this.learnedPatterns.commonKeywords.set(word, current + count);
        });
      }

      // Learn meta tag patterns
      if (results.meta) {
        this.learnedPatterns.metaPatterns.push({
          titleLength: results.meta.title?.optimized?.length || 0,
          descriptionLength: results.meta.metaDescription?.optimized?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 patterns
        if (this.learnedPatterns.metaPatterns.length > 100) {
          this.learnedPatterns.metaPatterns.shift();
        }
      }

      // Learn schema patterns
      if (results.schema?.detected) {
        results.schema.detected.forEach(type => {
          const current = this.learnedPatterns.schemaTypes.get(type) || 0;
          this.learnedPatterns.schemaTypes.set(type, current + 1);
        });
      }

      // Learn content patterns
      if (results.content) {
        this.learnedPatterns.contentPatterns.push({
          wordCount: results.content.readability?.wordCount || 0,
          readability: results.content.readability?.readability || 'unknown',
          keywordScore: results.content.keywordPlacement?.score || 0,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 patterns
        if (this.learnedPatterns.contentPatterns.length > 100) {
          this.learnedPatterns.contentPatterns.shift();
        }
      }

      this.status = 'ready';
      return {
        learned: true,
        patterns: {
          keywordsTracked: this.learnedPatterns.commonKeywords.size,
          metaPatterns: this.learnedPatterns.metaPatterns.length,
          contentPatterns: this.learnedPatterns.contentPatterns.length,
          schemaTypes: Array.from(this.learnedPatterns.schemaTypes.entries()).slice(0, 10)
        }
      };
    } catch (error) {
      this.status = 'error';
      console.error('Learning failed:', error);
      return { learned: false, error: error.message };
    }
  }

  getLearnedPatterns() {
    return {
      topKeywords: Array.from(this.learnedPatterns.commonKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, count })),
      avgMetaTitleLength: this.calculateAvgMetaTitleLength(),
      avgMetaDescLength: this.calculateAvgMetaDescLength(),
      commonSchemaTypes: Array.from(this.learnedPatterns.schemaTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([type, count]) => ({ type, count }))
    };
  }

  calculateAvgMetaTitleLength() {
    if (this.learnedPatterns.metaPatterns.length === 0) return 0;
    const sum = this.learnedPatterns.metaPatterns.reduce((acc, p) => acc + (p.titleLength || 0), 0);
    return Math.round(sum / this.learnedPatterns.metaPatterns.length);
  }

  calculateAvgMetaDescLength() {
    if (this.learnedPatterns.metaPatterns.length === 0) return 0;
    const sum = this.learnedPatterns.metaPatterns.reduce((acc, p) => acc + (p.descriptionLength || 0), 0);
    return Math.round(sum / this.learnedPatterns.metaPatterns.length);
  }

  async execute(results) {
    return await this.learn(results);
  }
}

