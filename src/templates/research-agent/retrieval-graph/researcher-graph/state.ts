import { Annotation } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { reduceDocs } from "../../shared/state.js";

/**
 * Private state for the retrieve_documents node in the researcher graph.
 */
export const QueryStateAnnotation = Annotation.Root({
  query: Annotation<string>(),
});

/**
 * State of the researcher graph / agent.
 */
export const ResearcherStateAnnotation = Annotation.Root({
  /**
   * A step in the research plan generated by the retriever agent.
   */
  question: Annotation<string>(),

  /**
   * A list of search queries based on the question that the researcher generates.
   */
  queries: Annotation<string[]>({
    default: () => [],
    reducer: (existing: string[], newQueries: string[]) => [
      ...existing,
      ...newQueries,
    ],
  }),

  /**
   * Populated by the retriever. This is a list of documents that the agent can reference.
   */
  documents: Annotation<
    Document[],
    Document[] | { [key: string]: any }[] | string[] | string | "delete"
  >({
    default: () => [],
    reducer: reduceDocs,
  }),

  // Feel free to add additional attributes to your state as needed.
  // Common examples include retrieved documents, extracted entities, API connections, etc.
});

export type ResearcherStateType = typeof ResearcherStateAnnotation.State;
