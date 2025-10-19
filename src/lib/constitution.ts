import constitutionData from './constitution_of_india.json';

export interface ConstitutionArticle {
  articleNumber: number;
  description: string;
}

const constitution: ConstitutionArticle[] = constitutionData.map((item: any, index: number) => ({
  articleNumber: index + 1,
  description: item.description
}));

export function searchConstitution(query: string): ConstitutionArticle[] {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 2);

  return constitution.filter(article => {
    const lowerDesc = article.description.toLowerCase();
    return keywords.some(keyword => lowerDesc.includes(keyword));
  }).slice(0, 5); // Limit to top 5 matches
}

export function getArticleByNumber(articleNumber: number): ConstitutionArticle | undefined {
  return constitution.find(article => article.articleNumber === articleNumber);
}

export { constitution };