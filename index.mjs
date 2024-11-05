console.log("Loading function");

// DynamoDBを利用するためにSDKをインポートします。
// AWS Lambdaには標準でAWS SDKが組み込まれているため、ライブラリのアップロードは不要です。
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";

// Clientの設定を行います。
// DynamoDBClientではなく、DynamoDBDocumentClientを使うとより高次元なAPIでデータ操作を行うことができます。
const DDBclient = new DynamoDBClient();
const documentClient = new DynamoDBDocumentClient(DDBclient);

export const handler = async (event, context, callback) => {
    // Eventから送信されてきた body のデータを読み取ります
    const body = JSON.parse(event.body);

    // body に入っているデータを取り出し、DynamoDBへのデータ登録のために設定します。
    const params = {
        TableName: 'TrainingApplicant-' + process.env.ENV,
        Item: {
            training: body.training,
            email: body.email,
            name: body.name,
            company: body.company,
            // TODO: このコメントを外してください
            // date: body.date,
        },
    };

    // DynamoDBDocumentClient を使ってデータを登録(Put)します。
    try {
        const results = await documentClient.send(new PutCommand(params));
        // データが正常に登録できたら、 Status Code に 201 を返します。
        console.log("Success: ", results);
        const response = {
            statusCode: 201,
            body: JSON.stringify(results),
        };
        callback(null, response);
    } catch (err) {
        // エラーが発生したらエラーログを出力し、Status Codeに 500 を返します。
        console.log("Error: ", err);
        const response = {
            statusCode: 500,
            body: JSON.stringify({
                Error: err.message,
                Reference: context.awsRequestId,
            }),
        };
        callback(null, response);
    }
};
