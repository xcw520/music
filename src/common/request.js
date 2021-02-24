import serverUrl from './config'

const request = (config) => {
	config.url = serverUrl.serverUrl + '/' + config.url;
	if(!config.data){
		config.data = {};
	}
	// if(!config.withCredentials){
	// 	config.withCredentials = true;
	// }
	// console.log(config);
	return new Promise(function(resolve, reject) {
		uni.request(config).then(responses => {
			if (responses[0]) {
				reject({message : "网络超时"});
			} else {
				let response = responses[1]; 
				resolve(response);
			}
		}).catch(error => {
			reject(error);
		})
	})
};

export default request;