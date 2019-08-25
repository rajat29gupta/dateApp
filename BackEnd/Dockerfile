
FROM node

EXPOSE 3000
#COPY . Admin
COPY ./NodeServer/rethinknodeserver29march18 Register
#COPY surveyjs-angular/Customer_SunnVale Customer_SunnVale
WORKDIR Register
RUN npm install
#RUN ng new surveyjs-angular-cli
#RUN cd surveyjs-angular-cli
#RUN npm install -save survey-angular
#RUN npm install -save surveyjs-editor
#RUN npm install
CMD ["node", "server.js"]
