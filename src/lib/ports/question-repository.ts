import type { Question } from '../domain/questions/question';

/** Port de lecture du dataset. Le cœur ne sait pas d'où viennent les données. */
export interface QuestionRepository {
	/** Liste les identifiants des RFE disponibles (un fichier JSON par RFE). */
	listerRfe(): Promise<string[]>;
	/** Liste les questions d'une RFE. */
	listerQuestions(rfe: string): Promise<Question[]>;
}
