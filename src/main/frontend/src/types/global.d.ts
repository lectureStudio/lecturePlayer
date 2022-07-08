declare module '*.css';
declare module '*.scss';


interface HTMLMediaElement {

	setSinkId(id: string): Promise<undefined>;

}