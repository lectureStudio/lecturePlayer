

export interface Book {
	id: string;
	title: string;
	authors: string[];
	publishYear?: string;
	color: "black" | "blue" | "brown" | "green" | "red" | "white" | "yellow";
}


/**
* Base shape of the request input parameters
* this is later on extended for each resource+method
* to match the service requirements
*/
export interface RequestOptions {
	body?: unknown;
	headers?: Record<string, string>;
	queryParameters?: Record<string, string>;
}

export interface ListBookOptions extends RequestOptions {
	// GET Request don't contain a body
	// setting this as optional never won't require
	// our users to set the body, and prevents them to
	// set any value other than undefined.
	body?: never;
}

export interface CreateBookOptions extends RequestOptions {
	body: Book;
}

export interface UpdateBookOptions extends RequestOptions {
	body: Book;
	headers?: { etag?: string };
}

export interface GetBookOptions extends RequestOptions {
	body?: never;
}

export interface DeleteBookOptions extends RequestOptions {
	headers?: { etag?: string };
}




/**
 * Base shape for a Response. This interface is extended
 * to provide the specific shape for the responses
 * of each resource+verb.
 */
export interface Response {
	status: string;
	body?: unknown;
	headers?: Record<string, unknown>;
  }
  
  export interface ErrorResponse extends Response {
	// String literal unions provide a predefined set of
	// possible status codes that we can get. This helps
	// the TS language server to be able to narrow down
	// the types through control flow analysis.
	status: "400" | "404" | "500";
	body: {
	  errorCode: string;
	  message: string;
	};
  }
  
  export interface AddBook201Response extends Response {
	status: "201";
	body?: never;
  }
  
  export interface ListBooks200Response extends Response {
	status: "200";
	body: Book[];
  }
  
  export interface UpdateBook201Response extends Response {
	status: "201";
	// Response doesn't send a body payload so we set it to
	// never so our users know they shouldn't expect one.
	body?: never;
  }
  
  export interface GetBook200Response extends Response {
	status: "200";
	body: Book;
  }
  
  export interface DeleteBook201Response extends Response {
	status: "201";
	body?: never;
  }




/**
 * Interface used to define the REST API
 */
export interface BookLibrary {
	"/book": {
		get: (
			input?: ListBookOptions
		) => Promise<ListBooks200Response | ErrorResponse>;
		post: (
			input: CreateBookOptions
		) => Promise<AddBook201Response | ErrorResponse>;
		put: (
			input: UpdateBookOptions
		) => Promise<UpdateBook201Response | ErrorResponse>;
	};
	"/book/{bookId}": {
		get: (
			input?: GetBookOptions
		) => Promise<GetBook200Response | ErrorResponse>;
		delete: (
			input?: DeleteBookOptions
		) => Promise<DeleteBook201Response | ErrorResponse>;
	};
}

/**
 * Helper type that matches a string with a Template
 * we use this to figure out if a string contains
 * one or more path parameters. Path parameters
 * are segments of the path that start with '/' and
 * are enclosed by '{}'
 */
export type PathParameter<TPath extends string> =
	// Define our template in terms of Head/{Parameter}Tail
	TPath extends `${infer Head}/{${infer Parameter}}${infer Tail}`
	? // We can call PathParameter<Tail> recursively to
	// match the template against the Tail of the path
	[pathParameter: string, ...params: PathParameter<Tail>]
	: // If no parameters were found we get an empty tuple
	[];

/**
 * Defines the type for the path function that will be part
 * of the client. This will only accept a string that
 * matches any of the keys of our BookLibrary interface
 */
export type Path = <TPath extends keyof BookLibrary>(
	path: TPath,
	// Our PathParameter helper type gives us a tuple
	// of the parameters that were found. If we spread
	// the tuple, we get each single parameter as a positiona
	// parameter of this function
	...pathParam: PathParameter<TPath>
) => BookLibrary[TPath]; // We can access elements of an interface by key

/**
 * This is our client factory function.
 * It takes the BaseURL of the service and returns a client
 * with a `path` function.
 */
export declare function BooksClient(baseUrl: string): { path: Path };



// Create a new client
const client = BooksClient("http://localhost");

// List all the books
const listBooks = client.path("/book/{bookId}", "1").;