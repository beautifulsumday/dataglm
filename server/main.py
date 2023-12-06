import os
import requests
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS

from kernel import CodeKernel, execute
from authentication import current_task, set_current_task

TRUNCATE_LENGTH = 1024
load_dotenv()
CHATGLM3_API = os.getenv('CHATGLM3_API')

KERNEL_INS = CodeKernel()

app = Flask(__name__)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT+Beautifulsumday'
app.template_folder = "../dist/"
app.static_folder = "../dist/"
app.static_url_path = "/static"
CORS(app, resources=r"/*", supports_credentials=True)

def postprocess_text(text: str) -> str:
    text = text.replace("\(", "$")
    text = text.replace("\)", "$")
    text = text.replace("\[", "$$")
    text = text.replace("\]", "$$")
    text = text.replace("<|assistant|>", "")
    text = text.replace("<|observation|>", "")
    text = text.replace("<|system|>", "")
    text = text.replace("<|user|>", "")
    return text.strip()

def stream_code(data):
    while True:
        again = False
        history = []
        with requests.post(CHATGLM3_API+"/stream/run", stream=True, json=data) as response:
            for line in response.iter_content(chunk_size=None): # 
                line = line.decode("utf-8")
                if line:
                    if line.startswith("<|observation|>"):
                        code = line.split("<|observation|>")[-1]
                        print("这里是代码："+code)
                        try:
                            res_type, res = execute(code, KERNEL_INS)
                        except Exception as e:
                            # st.error(f'Error when executing code: {e}')
                            return
                        
                        print("Received:", res_type, res)
                        if res_type == 'text' and len(res) > TRUNCATE_LENGTH:
                            res = res[:TRUNCATE_LENGTH] + ' [TRUNCATED]'

                        history.append({"role": "<|observation|>", 
                                        "content": '[Image]' if res_type == 'image' else postprocess_text(res)})
                        if res_type == 'image':
                            base64_str = "![base64 image](/data:image/png;base64,"+res+")"
                            yield base64_str
                        else:
                            yield postprocess_text(res)

                        again = True
                    else:
                        print(line, end="")
                        yield line
        if again:
            data["history"] = history
            # 删除data中的query
            if "query" in data:
                del data["query"]
            if "upload_file" in data:
                del data["upload_file"]
            print("data", data)
        else:
            break


@app.route('/api/stream/run', methods=['GET', 'POST'])
def run():
    data_json = request.json
    query = data_json.get("query")
    
    task_id = current_task._get_current_object()

    if task_id is None:
        try:
            with requests.get(CHATGLM3_API+"/generate_task") as response:
                res = response.json()
                task_id = res["task_id"]
                set_current_task(task_id)
        except Exception as e:
            return Response("task_id generate error", mimetype='text/event-stream')

    data = {
        "query": query,
        "task_id": task_id
    }

    return Response(stream_code(data), mimetype='text/event-stream')

@app.route('/api/stop', methods=['GET'])
def stop():  
    task_id = current_task._get_current_object()

    data = {
        "task_id": task_id
    }

    if task_id is None:
        return jsonify({"status": "400", "message": "task_id is None"})
    else:
        try:
            with requests.post(CHATGLM3_API+"/stop", json=data) as response:
                res = response.json()
                status = res["status"]
                if status == "200":
                    return jsonify({"status": "200", "message": "stop operation success"})
                else:
                    return jsonify({"status": "400", "message": "stop operation error"})
        except Exception as e:
            print(e )
            return jsonify({"status": "400", "message": "stop operation error"})

@app.route('/api/clear', methods=['GET'])
def clear():  
    try:
        with requests.get(CHATGLM3_API+"/generate_task") as response:
            res = response.json()
            task_id = res["task_id"]
            set_current_task(task_id)
    except Exception as e:
        return jsonify({"status": "400", "message": "clear operation error"})
    
    return jsonify({"status": "200", "message": "clear operation success"})


@app.route("/api/upload", methods=["POST"])
def upload_file():
    task_id = current_task._get_current_object()

    if task_id is None:
        return jsonify({"status": "400", "message": "task_id is None"})

    file_buffer = request.files['file']
    f_name = secure_filename(file_buffer.filename)

    try:
        file_path = os.path.join("./store/", f_name)
        # 获得文件的绝对路径
        file_buffer.save(file_path)
        file_path = os.path.abspath(file_path)

        try:
            data = {"task_id": task_id, "upload_file": file_path}
            with requests.post(CHATGLM3_API+"/upload", json=data) as response:
                res = response.json()
                status = res["status"]
                if status == "200":
                    return jsonify({"status": "200", "message": "upload success"})
                else:
                    return jsonify({"status": "400", "message": "upload operation error"})
        except Exception as e:
            print(e)
            return jsonify({"status": "400", "message": "upload operation error"})

    except FileNotFoundError as e:
        print(e)
        return jsonify({"status": "400", "message": "upload operation error"})

    return jsonify({"status": "200", "message": "upload success"})

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True, port=60006)