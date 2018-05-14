/**
 *  所有的异步action均在此处自行创建
 *  @author will.xu
 *  @providesModule FetchActions
 * */
import { fetchKeys } from 'fetchKeyMap';
import createFetchActions from 'createFetchActions';
export default createFetchActions(fetchKeys);


